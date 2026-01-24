interface Pdf {
  name: string;
  date: string;
  type: string;
  owner: string;
  data: Blob;
}

interface PDFDocument {
  _id: string;
  name: string;
  date: string;
  type: string;
  owner: string;
  gridFsFileId: string;
}

export type { Pdf, PDFDocument };
