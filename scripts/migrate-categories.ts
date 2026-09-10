/**
 * Creates default category documents and migrates projects that still store
 * category as a plain string (ecommerce | game | web3 | other) into references.
 *
 * Run from studio/:
 *   npm run seed:categories
 * or:
 *   npx sanity exec scripts/migrate-categories.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-05-15'})

const DEFAULT_CATEGORIES = [
  {
    _id: 'category.ecommerce',
    title: 'E-commerce',
    slug: 'ecommerce',
    description: 'Storefronts, product pages, and shopping flows',
    order: 1,
  },
  {
    _id: 'category.game',
    title: 'Game',
    slug: 'game',
    description: 'Game UI, hubs, and interactive experiences',
    order: 2,
  },
  {
    _id: 'category.web3',
    title: 'Web 3',
    slug: 'web3',
    description: 'Dashboards, wallets, and on-chain products',
    order: 3,
  },
  {
    _id: 'category.other',
    title: 'Other',
    slug: 'other',
    description: 'Brand sites, tools, and custom builds',
    order: 4,
  },
] as const

async function ensureCategories() {
  const tx = client.transaction()
  for (const category of DEFAULT_CATEGORIES) {
    tx.createIfNotExists({
      _id: category._id,
      _type: 'category',
      title: category.title,
      slug: {_type: 'slug', current: category.slug},
      description: category.description,
      order: category.order,
    })
  }
  await tx.commit()
  console.log(`Ensured ${DEFAULT_CATEGORIES.length} category documents.`)
}

async function migrateProjectCategoryReferences() {
  const projects = await client.fetch<
    Array<{_id: string; category: unknown}>
  >(`*[_type == "project"]{_id, category}`)

  let patched = 0
  let skipped = 0

  for (const project of projects) {
    const value = project.category

    if (
      value &&
      typeof value === 'object' &&
      '_ref' in value &&
      typeof (value as {_ref?: string})._ref === 'string'
    ) {
      skipped += 1
      continue
    }

    if (typeof value !== 'string') {
      console.warn(`Skip ${project._id}: category is not a legacy string.`)
      skipped += 1
      continue
    }

    const match = DEFAULT_CATEGORIES.find((item) => item.slug === value)
    if (!match) {
      console.warn(`Skip ${project._id}: unknown legacy category "${value}".`)
      skipped += 1
      continue
    }

    await client
      .patch(project._id)
      .set({
        category: {_type: 'reference', _ref: match._id},
      })
      .commit()
    patched += 1
  }

  console.log(`Migrated ${patched} projects. Skipped ${skipped}.`)
}

async function main() {
  await ensureCategories()
  await migrateProjectCategoryReferences()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
