import {defineField, defineType} from 'sanity'

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
      type: 'string',
      group: 'card',
      options: {
        list: [
          {title: 'E-commerce', value: 'ecommerce'},
          {title: 'Game', value: 'game'},
          {title: 'Web 3', value: 'web3'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
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
        'Intro copy under the title in the project details modal (above the landing page image).',
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
      name: 'caseStudyImage',
      title: 'Landing page image',
      type: 'image',
      group: 'modal',
      description:
        'Full-length screenshot of the designed website. Users scroll this image inside the modal. Prefer a high-resolution export (2000px+ wide) for sharpness.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Describe the landing page for accessibility.',
        }),
      ],
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
      category: 'category',
      hasCaseStudy: 'caseStudyImage.asset',
    },
    prepare({title, media, category, hasCaseStudy}) {
      const categoryLabel = typeof category === 'string' ? category : 'project'
      const modalStatus = hasCaseStudy ? 'modal ready' : 'no landing image'
      return {
        title,
        media,
        subtitle: `${categoryLabel} · ${modalStatus}`,
      }
    },
  },
})
