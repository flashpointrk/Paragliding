/**
 * The shared item type for the public gallery feed — used by both the
 * server-rendered first page and the client pages from `/api/gallery`. It
 * guarantees the two sides return the same fields.
 */
export interface GalleryItem {
  id: string;
  url: string;
  title: string | null;
  altText: string | null;
  titleTr: string | null;
  altTextTr: string | null;
  category: string;
  width: number | null;
  height: number | null;
  /** "image" | "video" — decides whether the feed renders <Image> or <video>. */
  type: string;
}
