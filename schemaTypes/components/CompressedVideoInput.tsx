import {useCallback, useEffect, useRef, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {set, unset, useClient, type ObjectInputProps} from 'sanity'
import {
  MAX_VIDEO_WIDTH,
  WARN_ABOVE_BYTES,
  compressVideoFile,
  formatBytes,
} from '../lib/compressVideo'

type VideoFileValue = {
  _type?: string
  asset?: {_type?: string; _ref?: string}
  alt?: string
  _upload?: unknown
}

type Phase = 'idle' | 'compressing' | 'uploading' | 'error'

/**
 * File input that compresses videos (max ~1280px wide H.264) before uploading to Sanity.
 */
export function CompressedVideoInput(props: ObjectInputProps) {
  const {value, onChange, readOnly} = props
  const fileValue = value as VideoFileValue | undefined
  const client = useClient({apiVersion: '2026-05-15'})
  const inputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const assetRef = fileValue?.asset?._ref
  const busy = phase === 'compressing' || phase === 'uploading'

  useEffect(() => {
    let cancelled = false
    if (!assetRef) {
      setPreviewUrl(null)
      return
    }

    client
      .fetch<string | null>(`*[_id == $id][0].url`, {id: assetRef})
      .then((url) => {
        if (!cancelled) setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [assetRef, client])

  const clearVideo = useCallback(() => {
    onChange(unset(['asset']))
    setStatus(null)
    setPhase('idle')
    setProgress(0)
  }, [onChange])

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]
      if (!file || readOnly || busy) return

      setPhase('compressing')
      setProgress(0)
      setStatus('Preparing video…')

      try {
        const result = await compressVideoFile(file, {
          onProgress: setProgress,
          onStatus: setStatus,
        })

        setPhase('uploading')
        setStatus(`Uploading ${formatBytes(result.outputBytes)}…`)
        setProgress(0.97)

        const asset = await client.assets.upload('file', result.file, {
          filename: result.file.name,
          contentType: result.file.type || 'video/mp4',
        })

        onChange(
          set({
            ...(fileValue ?? {}),
            _type: fileValue?._type || 'video',
            asset: {_type: 'reference', _ref: asset._id},
          }),
        )

        const warn =
          result.outputBytes > WARN_ABOVE_BYTES
            ? ` Warning: still over ${formatBytes(WARN_ABOVE_BYTES)} — consider a shorter clip.`
            : ''
        setStatus(
          result.skipped
            ? `Uploaded ${formatBytes(result.outputBytes)}.${warn}`
            : `Uploaded compressed video (${formatBytes(result.originalBytes)} → ${formatBytes(result.outputBytes)}).${warn}`,
        )
        setPhase('idle')
        setProgress(1)
      } catch (error) {
        console.error('Video compress/upload failed', error)
        setPhase('error')
        setStatus(
          error instanceof Error
            ? error.message
            : 'Could not compress or upload this video. Try a smaller MP4.',
        )
      } finally {
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [busy, client, fileValue, onChange, readOnly],
  )

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} shadow={1} tone="transparent" border>
        <Stack space={3}>
          <Text size={1} muted>
            Videos are automatically compressed on upload (max width {MAX_VIDEO_WIDTH}px, H.264) to
            improve modal loading speed. Files under 4&nbsp;MB upload as-is.
          </Text>

          {previewUrl ? (
            <Box>
              <video
                src={previewUrl}
                controls
                playsInline
                preload="metadata"
                style={{display: 'block', width: '100%', maxHeight: 280, background: '#000'}}
              />
            </Box>
          ) : null}

          <Flex gap={2} wrap="wrap">
            <Button
              text={assetRef ? 'Replace video' : 'Upload video'}
              tone="primary"
              mode="ghost"
              disabled={Boolean(readOnly) || busy}
              onClick={() => inputRef.current?.click()}
            />
            {assetRef ? (
              <Button
                text="Remove"
                tone="critical"
                mode="ghost"
                disabled={Boolean(readOnly) || busy}
                onClick={clearVideo}
              />
            ) : null}
          </Flex>

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            disabled={Boolean(readOnly) || busy}
            onChange={(event) => {
              void handleFiles(event.currentTarget.files)
            }}
          />

          {busy ? (
            <Card padding={3} radius={2} tone="primary">
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  {phase === 'compressing' ? 'Compressing…' : 'Uploading…'}
                </Text>
                <Text size={1}>{status}</Text>
                <Box
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--card-border-color)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      height: '100%',
                      width: `${Math.round(progress * 100)}%`,
                      background: 'var(--card-focus-ring-color, #2276fc)',
                      transition: 'width 160ms ease',
                    }}
                  />
                </Box>
              </Stack>
            </Card>
          ) : null}

          {!busy && status ? (
            <Card padding={3} radius={2} tone={phase === 'error' ? 'critical' : 'positive'}>
              <Text size={1}>{status}</Text>
            </Card>
          ) : null}
        </Stack>
      </Card>

      <Stack space={2}>
        <Text size={1} weight="semibold">
          Accessible description
        </Text>
        <TextInput
          value={fileValue?.alt ?? ''}
          disabled={Boolean(readOnly)}
          placeholder="Short description of the video"
          onChange={(event) => {
            const next = event.currentTarget.value
            onChange(next ? set(next, ['alt']) : unset(['alt']))
          }}
        />
      </Stack>
    </Stack>
  )
}
