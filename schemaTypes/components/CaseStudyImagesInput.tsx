import {useEffect, useRef} from 'react'
import {type ArrayOfObjectsInputProps, useClient, useFormValue} from 'sanity'

type LegacyImage = {
  _type?: string
  asset?: {_ref?: string; _type?: string}
  alt?: string
  hotspot?: unknown
  crop?: unknown
}

function arrayKey() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}

/**
 * When a document still has the removed singular `caseStudyImage` field,
 * copy it into `caseStudyImages` (if empty) and unset the legacy field.
 * Runs once per document open using the editor's Studio session.
 */
export function CaseStudyImagesInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion: '2026-05-15'})
  const documentId = useFormValue(['_id']) as string | undefined
  const legacy = useFormValue(['caseStudyImage']) as LegacyImage | undefined
  const ranForId = useRef<string | null>(null)

  useEffect(() => {
    if (!documentId || !legacy?.asset?._ref) return
    if (ranForId.current === documentId) return
    ranForId.current = documentId

    const patch = client.patch(documentId)

    if (!props.value?.length) {
      patch.set({
        caseStudyImages: [
          {
            _type: 'image',
            _key: arrayKey(),
            asset: {_type: 'reference', _ref: legacy.asset._ref},
            ...(legacy.alt ? {alt: legacy.alt} : {}),
            ...(legacy.hotspot ? {hotspot: legacy.hotspot} : {}),
            ...(legacy.crop ? {crop: legacy.crop} : {}),
          },
        ],
      })
    }

    patch
      .unset(['caseStudyImage'])
      .commit({visibility: 'async'})
      .catch((error: unknown) => {
        console.error('Failed to migrate caseStudyImage → caseStudyImages', error)
        ranForId.current = null
      })
  }, [client, documentId, legacy, props.value])

  return props.renderDefault(props)
}
