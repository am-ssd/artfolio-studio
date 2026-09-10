/**
 * Move legacy singular `caseStudyImage` into `caseStudyImages[]`, then unset it.
 *
 * From studio/:
 *   npx sanity exec scripts/migrate-case-study-images.ts --with-user-token
 */
import {randomBytes} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-05-15'})

type LegacyImage = {
  _type?: string
  asset?: {_ref?: string; _type?: string}
  alt?: string
  hotspot?: unknown
  crop?: unknown
}

function arrayKey() {
  return randomBytes(6).toString('hex')
}

async function main() {
  const docs = await client.fetch<
    Array<{_id: string; caseStudyImage?: LegacyImage; caseStudyImages?: LegacyImage[]}>
  >(`*[_type == "project" && defined(caseStudyImage)]{_id, caseStudyImage, caseStudyImages}`)

  console.log(`Found ${docs.length} project(s) with legacy caseStudyImage`)

  for (const doc of docs) {
    const legacy = doc.caseStudyImage
    if (!legacy?.asset?._ref) {
      await client.patch(doc._id).unset(['caseStudyImage']).commit()
      console.log(`✓ ${doc._id}: unset empty legacy field`)
      continue
    }

    const hasImages = Array.isArray(doc.caseStudyImages) && doc.caseStudyImages.length > 0
    const patch = client.patch(doc._id)

    if (!hasImages) {
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

    await patch.unset(['caseStudyImage']).commit()
    console.log(
      hasImages
        ? `✓ ${doc._id}: kept existing caseStudyImages, unset legacy field`
        : `✓ ${doc._id}: migrated caseStudyImage → caseStudyImages`,
    )
  }

  console.log('Done. Refresh Studio — the unknown-field warning should be gone.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
