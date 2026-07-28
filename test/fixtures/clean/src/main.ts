// Clean fixture source: no community-plugin review findings. The validator
// should report zero errors and zero warnings for this file.
export function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-");
}
