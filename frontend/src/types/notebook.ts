interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  content: string;
}

interface Pages {
  page_number: number;
  slide_number: number;
  id_pdf: string;
  content: string;
  text_boxes: Box[];
  highlights: Box[];
}

interface Notebook {
  _id?: string;
  name: string;
  subject: string;
  date: string;
  owner: string;
  type: string;
  last_page: number;
  pages: Pages[];
}

export type { Notebook };
