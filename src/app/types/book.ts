export interface Book {
  // ISBN: string;
  id: number;
  name: string;
  authorId: number;
  publishDate: string;
  pagesCount: number;
  synopsis?: string;
}
