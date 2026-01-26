const cerebrasClient = require('../config/cerebras');
const { notebookModel } = require('../models/notebooksModel');
const { pdfModel } = require('../models/pdfsModel');
const pdfParse = require('pdf-parse').PDFParse;
const { getGridFSBucket } = require('../config/gridfs');

exports.summarizeNotebook = async (req, res) => {
    try {
        const notebookId = req.params.notebookId;

        if (!notebookId) {
            return res.status(400).json({ error: 'Notebook ID is required for summarization' });
        }

        const notebook = await notebookModel.findById(notebookId);
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        let textToSummarize = '';
        let pdfPageTexts = {};
        let totalPdfPages = 0;

        if (notebook.id_pdf) {
            const pdf = await pdfModel.findById(notebook.id_pdf);
            if (pdf) {
                try {
                    const gridFSBucket = getGridFSBucket();
                    const chunks = [];
                    const downloadStream = gridFSBucket.openDownloadStream(pdf.gridFsFileId);

                    await new Promise((resolve, reject) => {
                        downloadStream.on('data', (chunk) => chunks.push(chunk));
                        downloadStream.on('error', reject);
                        downloadStream.on('end', resolve);
                    });

                    const pdfBuffer = Buffer.concat(chunks);

                    const parser = new pdfParse({ data: pdfBuffer });
                    const pdfData = await parser.getText();
                    const textContent = pdfData.text;

                    totalPdfPages = 1;
                    pdfPageTexts[1] = textContent;
                } catch (pdfError) {
                    console.error('Error extracting PDF text:', pdfError);
                }
            }
        }

        const notesBySlide = {};
        if (notebook.pages && notebook.pages.length > 0) {
            for (const page of notebook.pages) {
                if (page.slide_number && page.note_content) {
                    if (!notesBySlide[page.slide_number]) {
                        notesBySlide[page.slide_number] = [];
                    }
                    notesBySlide[page.slide_number].push({
                        pageNumber: page.page_number,
                        content: page.note_content
                    });
                }
            }
        }

        for (let slideNum = 1; slideNum <= totalPdfPages; slideNum++) {
            textToSummarize += `--- Slide ${slideNum} ---\n`;
            if (pdfPageTexts[slideNum]) {
                textToSummarize += pdfPageTexts[slideNum] + '\n\n';
            } else {
                textToSummarize += '\n';
            }

            if (notesBySlide[slideNum]) {
                for (const note of notesBySlide[slideNum]) {
                    textToSummarize += `--- Note (Page ${note.pageNumber}) ---\n`;
                    textToSummarize += note.content + '\n\n';
                }
            }
        }

        if (!textToSummarize.trim()) {
            return res.status(400).json({ error: 'No content found to summarize' });
        }
        const completionCreateResponse = await cerebrasClient.chat.completions.create({
            messages: [{
                role: 'user',
                content: 'Summarize this text maintaining the key points and considering it is for educational purposes so it has to be clear without losing important informations. The content could be in markdown format so, in that case, keep a markdown format; otherwise give an output of a normal text. It is very important that you keep the same language as the given text ' + textToSummarize
            }],
            model: 'llama3.1-8b'
        });

        res.json({ summary: completionCreateResponse });
    } catch (error) {
        console.error('Error summarizing notebook:', error);
        res.status(500).json({ error: 'Error summarizing notebook', details: error.message });
    }
}