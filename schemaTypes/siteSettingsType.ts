import {defineField, defineType} from 'sanity'

const imageWithAlt = (
  name: string,
  title: string,
  group: 'hero' | 'contact',
  description: string,
) =>
  defineField({
    name,
    title,
    type: 'image',
    group,
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        type: 'string',
        title: 'Alternative text',
      }),
    ],
  })

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'profile', title: 'Profile', default: true},
    {name: 'hero', title: 'Hero'},
    {name: 'contact', title: 'Contact'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      group: 'profile',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      group: 'profile',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availability',
      type: 'string',
      group: 'profile',
      initialValue: 'Available for Freelance & Fulltime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      type: 'string',
      group: 'profile',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'telegram',
      type: 'string',
      group: 'profile',
    }),
    defineField({
      name: 'discord',
      type: 'string',
      group: 'profile',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline (before highlight)',
      type: 'string',
      group: 'hero',
      initialValue: 'Biggest Personal Portfolio',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroHighlight',
      title: 'Hero highlight word',
      type: 'string',
      group: 'hero',
      initialValue: 'Designer!',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtext',
      type: 'text',
      group: 'hero',
      rows: 3,
      initialValue:
        'Our Template is full Perfect for all device. You can visit our template all device easily.',
    }),
    defineField({
      name: 'categoryBadge',
      title: 'Hero badge text',
      type: 'string',
      group: 'hero',
      initialValue: '300+ category',
    }),
    imageWithAlt(
      'heroTopLeft',
      'Top-left mockup',
      'hero',
      'Desktop: upper-left floating mockup. Mobile: top-left in the 2×2 grid.',
    ),
    imageWithAlt(
      'heroTopRight',
      'Top-right mockup',
      'hero',
      'Desktop: upper-right floating mockup. Mobile: top-right in the 2×2 grid.',
    ),
    imageWithAlt(
      'heroBottomLeft',
      'Bottom-left mockup',
      'hero',
      'Desktop: lower-left floating mockup. Mobile: bottom-left in the 2×2 grid.',
    ),
    imageWithAlt(
      'heroBottomRight',
      'Bottom-right mockup',
      'hero',
      'Desktop: lower-right floating mockup (with category badge). Mobile: bottom-right in the 2×2 grid.',
    ),
    imageWithAlt(
      'contactImage',
      'Contact illustration',
      'contact',
      'Large illustration shown on the left of the contact section.',
    ),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
