const cerebrasClient = require('../config/cerebras');

exports.summarizeText = async (req, res) => {
    if (!req.body || !req.body.text) {
        return res.status(400).json({ error: 'Text is required for summarization' });
    }
    const notebook = req.body.text;
    const text = notebook.notes ? notebook.notes.map(note => note.content).join('\n\n') : notebook;

    const completionCreateResponse = await cerebrasClient.chat.completions.create({
        messages: [{
            role: 'user', content:
                'Summarize this text maintaining the key points and considering it is for educational purposes so it has to be clear without losing important informations. The content could be in markdown format so, in that case, keep a markdown format; otherwise give an output of a normal text. It is very important that you keep the same language as the given text ' + text
        }],
        model: 'llama3.1-8b',
    });
    res.json({ summary: completionCreateResponse });
}