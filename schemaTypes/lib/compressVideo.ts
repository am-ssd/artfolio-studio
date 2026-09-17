import {FFmpeg} from '@ffmpeg/ffmpeg'
import {fetchFile, toBlobURL} from '@ffmpeg/util'

/** Skip compression for already-small uploads. */
export const SKIP_BELOW_BYTES = 4 * 1024 * 1024

/** Cap long edge so modal videos stay light. */
export const MAX_VIDEO_WIDTH = 1280

/** Soft ceiling after compression — warn if still larger. */
export const WARN_ABOVE_BYTES = 25 * 1024 * 1024

export type CompressVideoResult = {
  file: File
  skipped: boolean
  originalBytes: number
  outputBytes: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export {formatBytes}

let ffmpegSingleton: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function getFfmpeg(onLog?: (message: string) => void): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()
    ffmpeg.on('log', ({message}) => onLog?.(message))

    // Non-MT core works without Cross-Origin-Isolation headers in Studio.
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegSingleton = ffmpeg
    return ffmpeg
  })()

  try {
    return await loadPromise
  } catch (error) {
    loadPromise = null
    throw error
  }
}

/**
 * Transcode a video to H.264/AAC MP4 capped at MAX_VIDEO_WIDTH.
 * Falls back to the original file if compression fails or grows the file.
 */
export async function compressVideoFile(
  file: File,
  options?: {
    onProgress?: (ratio: number) => void
    onStatus?: (message: string) => void
  },
): Promise<CompressVideoResult> {
  const originalBytes = file.size

  if (!file.type.startsWith('video/')) {
    return {file, skipped: true, originalBytes, outputBytes: originalBytes}
  }

  if (originalBytes <= SKIP_BELOW_BYTES) {
    options?.onStatus?.(`Already small (${formatBytes(originalBytes)}) — uploading as-is`)
    return {file, skipped: true, originalBytes, outputBytes: originalBytes}
  }

  options?.onStatus?.('Loading video compressor…')
  options?.onProgress?.(0.02)

  const ffmpeg = await getFfmpeg()
  const progressHandler = ({progress}: {progress: number}) => {
    // ffmpeg progress is 0–1; reserve headroom for upload phase in the UI
    options?.onProgress?.(Math.min(0.95, Math.max(0.02, progress)))
  }
  ffmpeg.on('progress', progressHandler)

  const inputName = `input${extensionFor(file)}`
  const outputName = 'output.mp4'

  try {
    options?.onStatus?.('Compressing video for faster loading…')
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      `scale='min(${MAX_VIDEO_WIDTH},iw)':-2`,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '28',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      outputName,
    ])

    if (exitCode !== 0) {
      throw new Error(`ffmpeg exited with code ${exitCode}`)
    }

    const data = await ffmpeg.readFile(outputName)
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const buffer = Uint8Array.from(bytes).buffer
    const compressed = new File([buffer], replaceExtension(file.name, 'mp4'), {
      type: 'video/mp4',
      lastModified: Date.now(),
    })

    // Prefer the smaller of original vs compressed
    if (compressed.size >= originalBytes) {
      options?.onStatus?.(
        `Compressed file was not smaller — uploading original (${formatBytes(originalBytes)})`,
      )
      return {file, skipped: true, originalBytes, outputBytes: originalBytes}
    }

    options?.onProgress?.(1)
    options?.onStatus?.(
      `Compressed ${formatBytes(originalBytes)} → ${formatBytes(compressed.size)}`,
    )
    return {
      file: compressed,
      skipped: false,
      originalBytes,
      outputBytes: compressed.size,
    }
  } finally {
    ffmpeg.off('progress', progressHandler)
    try {
      await ffmpeg.deleteFile(inputName)
    } catch {
      // ignore cleanup errors
    }
    try {
      await ffmpeg.deleteFile(outputName)
    } catch {
      // ignore cleanup errors
    }
  }
}

function extensionFor(file: File) {
  const fromName = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
  if (fromName && fromName.length <= 5) return fromName
  if (file.type === 'video/webm') return '.webm'
  if (file.type === 'video/quicktime') return '.mov'
  return '.mp4'
}

function replaceExtension(filename: string, ext: string) {
  const base = filename.replace(/\.[^.]+$/, '') || 'video'
  return `${base}.${ext}`
}
