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
  note_content: string;
  text_boxes: Box[];
  highlights: Box[];
}

interface Notebook {
  _id?: string;
  name: string;
  subject: string;
  date: string;
  id_pdf: string;
  owner: string;
  type: string;
  last_page: number;
  num_notebook_pages: number;
  pages: Pages[];
}

export type { Notebook };
