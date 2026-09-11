import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('category').title('Categories'),
      S.listItem()
        .title('Projects')
        .id('projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              S.listItem()
                .title('All projects')
                .child(S.documentTypeList('project').title('All projects')),
              S.listItem()
                .title('By category')
                .child(
                  S.documentTypeList('category')
                    .title('Projects by category')
                    .child((categoryId) =>
                      S.documentList()
                        .apiVersion('2024-06-01')
                        .title('Projects')
                        .schemaType('project')
                        .filter(
                          '_type == "project" && (category._ref == $categoryId || category._ref == $draftCategoryId)',
                        )
                        .params({
                          categoryId,
                          draftCategoryId: `drafts.${categoryId}`,
                        }),
                    ),
                ),
              S.listItem()
                .title('Uncategorized')
                .child(
                  S.documentList()
                    .apiVersion('2024-06-01')
                    .title('Uncategorized projects')
                    .schemaType('project')
                    .filter('_type == "project" && !defined(category._ref)'),
                ),
            ]),
        ),
    ])
