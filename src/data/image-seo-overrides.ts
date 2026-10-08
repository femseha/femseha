export type ImageSeoOverride = {
  image: string;
  imageAlt: string;
};

/**
 * الصور المقالية المولدة سابقًا تم إيقافها.
 * لن نضع صورة عامة أو شعارًا كصورة للمقال.
 * بعد رفع 10 صور أصلية معتمدة، نضيفها هنا بتعيين واضح لكل slug.
 */
export const IMAGE_SEO_OVERRIDES: Record<string, ImageSeoOverride> = {};

export function imageSeoForArticle(slug?: string): ImageSeoOverride | null {
  if (!slug) return null;
  return IMAGE_SEO_OVERRIDES[slug] || null;
}
