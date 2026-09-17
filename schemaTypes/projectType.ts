import {defineArrayMember, defineField, defineType} from 'sanity'
import {CaseStudyImagesInput} from './components/CaseStudyImagesInput'
import {CompressedVideoInput} from './components/CompressedVideoInput'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'card', title: 'Grid card', default: true},
    {name: 'modal', title: 'Project modal'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'card',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'card',
      to: [{type: 'category'}],
      description: 'Homepage category card this project belongs to.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Grid thumbnail',
      type: 'image',
      group: 'card',
      description: 'Shown on the homepage project grid. Click opens the project modal.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Manual order',
      type: 'number',
      group: 'card',
      description: 'Lower numbers appear first when sorting by order.',
      initialValue: 0,
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'card',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),

    // —— Project modal ——
    defineField({
      name: 'summary',
      title: 'Modal summary',
      type: 'text',
      group: 'modal',
      rows: 4,
      description:
        'Intro copy under the title in the project details modal (above the landing page media).',
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'url',
      title: 'Live website URL',
      type: 'url',
      group: 'modal',
      description:
        'Shown as “Currently implemented website link” in the modal. Opens in a new tab.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'caseStudyImages',
      title: 'Landing page media',
      type: 'array',
      group: 'modal',
      description:
        'Screenshots and videos stacked in order. Users scroll through them continuously in the modal. Images ~1400–1600px wide; videos are auto-compressed on upload for faster loading.',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Describe this section of the landing page for accessibility.',
            }),
          ],
        }),
        defineArrayMember({
          name: 'video',
          title: 'Video',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          description:
            'Automatically compressed on upload (max 1280px wide H.264) for faster modal loading.',
          components: {
            input: CompressedVideoInput,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Accessible description',
              description: 'Short description of the video for accessibility.',
            }),
          ],
        }),
      ],
      options: {
        layout: 'grid',
      },
      components: {
        input: CaseStudyImagesInput,
      },
    }),
    // Temporary: present so Studio does not flag stored legacy data as "Unknown field".
    // CaseStudyImagesInput copies any value into caseStudyImages and unsets this field.
    defineField({
      name: 'caseStudyImage',
      title: 'Legacy landing page image',
      type: 'image',
      group: 'modal',
      hidden: true,
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Manual order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Newest',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      categoryTitle: 'category.title',
      caseStudyImages: 'caseStudyImages',
    },
    prepare({title, media, categoryTitle, caseStudyImages}) {
      const count = Array.isArray(caseStudyImages) ? caseStudyImages.length : 0
      const modalStatus =
        count > 0 ? `${count} landing item${count === 1 ? '' : 's'}` : 'no landing media'
      return {
        title,
        media,
        subtitle: `${categoryTitle || 'No category'} · ${modalStatus}`,
      }
    },
  },
})
