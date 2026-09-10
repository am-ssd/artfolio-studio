import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Card title',
      type: 'string',
      description: 'Shown on the homepage category card.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'Stable id used when linking projects to this category.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Card description',
      type: 'text',
      rows: 3,
      description: 'Short copy under the title on the category card.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Card background image',
      type: 'image',
      description: 'Uploaded image used as the category card background.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Manual order',
      type: 'number',
      description: 'Lower numbers appear first on the homepage.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Manual order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'backgroundImage',
      order: 'order',
      slug: 'slug.current',
    },
    prepare({title, media, order, slug}) {
      return {
        title: title || 'Untitled category',
        media,
        subtitle: [slug, typeof order === 'number' ? `order ${order}` : null]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
