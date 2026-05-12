export const PRO_ONLY_TYPE_SLUGS = new Set(["file", "image"])

export function isProType(slug: string): boolean {
  return PRO_ONLY_TYPE_SLUGS.has(slug)
}
