interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  content: string;
}

interface Pages {
  pageNumber: number;
  slideNumber: number;
  pdfId: string;
  content: string;
  textBoxes: Box[];
  highlights: Box[];
}

interface Notebook {
  _id?: string;
  name: string;
  subject: string;
  date: string;
  owner: string;
  type: string;
  lastPage: number;
  pages: Pages[];
}

export type { Notebook };
