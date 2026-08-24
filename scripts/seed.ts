/**
 * Seed Artfolio Site Settings + Projects (thumbnails + modal case studies).
 *
 * From studio/:
 *   npm run seed
 *
 * Requires Sanity CLI login (`npx sanity login`).
 */
import {createReadStream, existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const heroAssetsRoot = path.resolve(__dirname, '../../web/public/assets/hero')
const caseStudyPath = path.resolve(
  __dirname,
  '../../web/public/assets/case-studies/freeze-frame-landing.png',
)

const client = getCliClient({apiVersion: '2026-05-15'})

type Category = 'ecommerce' | 'game' | 'web3' | 'other'

const DEFAULT_SUMMARY =
  'We are a creative design studio crafting distinctive brand identities that cut through noise, command attention, and endure. From strategy to execution, we transform ideas into powerful visual systems that connect, resonate, and scale.'

const PROJECTS: Array<{
  id: string
  title: string
  slug: string
  category: Category
  image: string
  order: number
  url?: string
  summary?: string
}> = [
  {
    id: 'project.alliance-rv',
    title: 'Alliance RV',
    slug: 'alliance-rv',
    category: 'other',
    image: '1.png',
    order: 1,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.freshflow-kitchen',
    title: 'FreshFlow Kitchen',
    slug: 'freshflow-kitchen',
    category: 'ecommerce',
    image: '2.png',
    order: 2,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.scarx-essentials',
    title: 'Scarx Essentials',
    slug: 'scarx-essentials',
    category: 'ecommerce',
    image: '3.png',
    order: 3,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.lux-absentia',
    title: 'Lux Absentia',
    slug: 'lux-absentia',
    category: 'ecommerce',
    image: '377.png',
    order: 4,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.pirates-hunt',
    title: 'Pirates Hunt',
    slug: 'pirates-hunt',
    category: 'game',
    image: '401.png',
    order: 5,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.pergosol-config',
    title: 'Pergosol Config',
    slug: 'pergosol-config',
    category: 'other',
    image: '499.png',
    order: 6,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.artfolio-fashion',
    title: 'Artfolio Fashion',
    slug: 'artfolio-fashion',
    category: 'ecommerce',
    image: '382.png',
    order: 7,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.web3-dashboard',
    title: 'Web3 Dashboard',
    slug: 'web3-dashboard',
    category: 'web3',
    image: '1.png',
    order: 8,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.yacht-club',
    title: 'Yacht Club',
    slug: 'yacht-club',
    category: 'other',
    image: '2.png',
    order: 9,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.noir-watch-co',
    title: 'Noir Watch Co',
    slug: 'noir-watch-co',
    category: 'ecommerce',
    image: '3.png',
    order: 10,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.mobile-commerce',
    title: 'Mobile Commerce',
    slug: 'mobile-commerce',
    category: 'ecommerce',
    image: '377.png',
    order: 11,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.arena-game-ui',
    title: 'Arena Game UI',
    slug: 'arena-game-ui',
    category: 'game',
    image: '401.png',
    order: 12,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.token-exchange',
    title: 'Token Exchange',
    slug: 'token-exchange',
    category: 'web3',
    image: '499.png',
    order: 13,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.studio-landing',
    title: 'Studio Landing',
    slug: 'studio-landing',
    category: 'other',
    image: '382.png',
    order: 14,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.market-kit',
    title: 'Market Kit',
    slug: 'market-kit',
    category: 'ecommerce',
    image: '1.png',
    order: 15,
    url: 'https://www.axoper.com/',
  },
  {
    id: 'project.freeze-frame',
    title: 'Freeze Frame Web UI Landing Page Design',
    slug: 'freeze-frame',
    category: 'other',
    image: '2.png',
    order: 0,
    url: 'https://www.axoper.com/',
    summary: DEFAULT_SUMMARY,
  },
]

async function uploadImage(filePath: string, filename: string) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing asset: ${filePath}`)
  }

  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename,
    contentType: 'image/png',
  })

  return asset._id as string
}

async function uploadHeroImage(filename: string) {
  return uploadImage(path.join(heroAssetsRoot, filename), filename)
}

async function uploadCaseStudy() {
  return uploadImage(caseStudyPath, 'freeze-frame-landing.png')
}

async function seedSiteSettings() {
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: 'Isomiddin Abdijobborov',
    location: 'Uzbekistan',
    availability: 'Available for Freelance & Fulltime',
    email: 'web3designer1222@gmail.com',
    telegram: '@VFX_mini',
    discord: 'right098',
    heroHeadline: 'Biggest Personal Portfolio',
    heroHighlight: 'Designer!',
    heroSubtext:
      'Our Template is full Perfect for all device. You can visit our template all device easily.',
    categoryBadge: '300+ category',
  })
  console.log('✓ Site Settings')
}

async function seedProjects() {
  const assetCache = new Map<string, string>()

  console.log('  uploading case study landing page...')
  const caseStudyAssetId = await uploadCaseStudy()
  console.log('✓ Case study image')

  for (const project of PROJECTS) {
    let assetId = assetCache.get(project.image)
    if (!assetId) {
      console.log(`  uploading thumbnail ${project.image}...`)
      assetId = await uploadHeroImage(project.image)
      assetCache.set(project.image, assetId)
    }

    await client.createOrReplace({
      _id: project.id,
      _type: 'project',
      title: project.title,
      slug: {_type: 'slug', current: project.slug},
      category: project.category,
      thumbnail: {
        _type: 'image',
        asset: {_type: 'reference', _ref: assetId},
        alt: `${project.title} preview`,
      },
      summary: project.summary ?? DEFAULT_SUMMARY,
      url: project.url ?? 'https://www.axoper.com/',
      caseStudyImage: {
        _type: 'image',
        asset: {_type: 'reference', _ref: caseStudyAssetId},
        alt: `${project.title} landing page`,
      },
      publishedAt: new Date(Date.UTC(2026, 0, 16 - project.order)).toISOString(),
      order: project.order,
    })
    console.log(`✓ ${project.title}`)
  }
}

async function main() {
  console.log(`Seeding ${client.config().projectId}/${client.config().dataset}...`)
  console.log(`Hero assets from: ${heroAssetsRoot}`)
  console.log(`Case study from: ${caseStudyPath}`)
  await seedSiteSettings()
  await seedProjects()
  console.log('Done. Open Studio and refresh the web app.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
