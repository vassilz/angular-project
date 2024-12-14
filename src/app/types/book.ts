export interface Book {
  // ISBN: string;
  id: number;
  name: string;
  author: string;
  publishDate: string;
  pagesCount: number;
  synopsis?: string;
}
