type TranslationItem = {
  slug: string;
  language: {
    code: string;
  };
};

type AlternateEntity = {
  translations: TranslationItem[];
};

export function buildAlternatePaths(
  entity: {
    translations: {
      slug: string;
      language?: {
        code: string;
      };
    }[];
  },
  basePath: string
) {
  return Object.fromEntries(
    entity.translations
      .filter((translation) => translation.language?.code)
      .map((translation) => [
        translation.language!.code,
        `/${translation.language!.code}/${basePath}/${translation.slug}`,
      ])
  );
}
