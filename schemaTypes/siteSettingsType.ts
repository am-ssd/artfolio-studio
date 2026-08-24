import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availability',
      type: 'string',
      initialValue: 'Available for Freelance & Fulltime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'telegram',
      type: 'string',
    }),
    defineField({
      name: 'discord',
      type: 'string',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline (before highlight)',
      type: 'string',
      initialValue: 'Biggest Personal Portfolio',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroHighlight',
      title: 'Hero highlight word',
      type: 'string',
      initialValue: 'Designer!',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtext',
      type: 'text',
      rows: 3,
      initialValue:
        'Our Template is full Perfect for all device. You can visit our template all device easily.',
    }),
    defineField({
      name: 'categoryBadge',
      title: 'Hero badge text',
      type: 'string',
      initialValue: '300+ category',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
