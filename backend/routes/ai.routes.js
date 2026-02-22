// POST /api/ai/assignment-response — Gemini reads PDFs natively (inlineData), formats response per outputFormat
// POST /api/ai/export-response — convert text to PDF or DOCX for download (when user clicks download)
const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const router = express.Router();

const GEMINI_MODEL = 'gemini-2.5-flash';

const uploadPdfs = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for instructions'), false);
    }
  },
}).array('pdfs', 5);

function getGeminiUrl() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

async function callGemini(contents) {
  const url = getGeminiUrl();
  if (!url) throw new Error('GEMINI_API_KEY is not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part || part.text == null) throw new Error('Invalid Gemini response format');
  return part.text.trim();
}

router.post('/assignment-response', (req, res, next) => {
  uploadPdfs(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const body = req.body || {};
    let title = body.title != null ? body.title : '';
    let instructions = body.instructions != null ? body.instructions : '';
    let difficulty = body.difficulty != null ? body.difficulty : 'medium';
    let outputFormat = body.outputFormat != null ? body.outputFormat : 'simple';
    let history = body.history;

    if (typeof history === 'string') {
      try {
        history = JSON.parse(history);
      } catch (_) {
        history = [];
      }
    }
    if (!Array.isArray(history)) history = [];

    const difficultyLine = `Difficulty of assignment: ${[ 'hard', 'medium', 'easy' ].includes(String(difficulty).toLowerCase()) ? difficulty : 'medium'}.`;

    const formatInstruction = {
      pdf: 'The teacher wants this response as a PDF document. Structure your reply with a clear title, sections, headings, and body text so it reads as a formal document.',
      docx: 'The teacher wants this response as a Word document. Structure your reply with a clear title, sections, headings, and body text suitable for a .docx document.',
      simple: 'The teacher wants a plain conversational response. No special document structure needed.',
    };
    const outputInstruction = formatInstruction[outputFormat] || formatInstruction.simple;

    const textPrompt = `You are helping a teacher prepare an assignment.

Assignment title: ${String(title).trim() || '(not provided)'}

${difficultyLine}

Instructions from the teacher:
${(instructions && String(instructions).trim()) || '(none provided)'}

IMPORTANT - Output format rule: You MUST put the actual assignment content (the questions or tasks for students) inside double quotation marks ("). Put any introduction, explanation, or conclusion OUTSIDE the quotes. Only the text that is the real assignment questions should appear between a pair of double quotes. Example structure: "Question 1: ... Question 2: ..." with your intro/conclusion before and after the quoted block if needed.

${outputInstruction}

${req.files && req.files.length > 0 ? 'The teacher has attached PDF file(s) above. Read and use their content when preparing the assignment.' : ''}`;

    const currentParts = [];
    const files = req.files || [];
    for (const file of files) {
      if (file.mimetype === 'application/pdf' && file.buffer && file.buffer.length) {
        currentParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: file.buffer.toString('base64'),
          },
        });
      }
    }
    currentParts.push({ text: textPrompt });

    const historyContents = history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const contents = [ ...historyContents, { role: 'user', parts: currentParts } ];

    const responseText = await callGemini(contents);

    res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error('AI assignment-response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get AI response',
    });
  }
});

// Extract only the content inside double quotes (actual assignment questions); used for PDF/DOCX export
function extractQuotedContent(fullText) {
  const matches = fullText.match(/"([^"]*)"/g);
  if (!matches || matches.length === 0) return fullText;
  return matches.map((m) => m.slice(1, -1)).join('\n\n').trim() || fullText;
}

// POST /api/ai/export-response — body: { content: string, format: 'pdf' | 'docx' }; returns file download (only quoted assignment content)
router.post('/export-response', async (req, res) => {
  try {
    const { content = '', format = 'pdf' } = req.body;
    const fullText = String(content).trim() || 'No content to export.';
    const text = extractQuotedContent(fullText);
    const safeFormat = format === 'docx' ? 'docx' : 'pdf';

    if (safeFormat === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      const filename = 'assignment-response.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);
      doc.fontSize(11).text(text, { align: 'left', lineGap: 4 });
      doc.end();
      return;
    }

    if (safeFormat === 'docx') {
      const paragraphs = text.split(/\r?\n/).map((line) =>
        new Paragraph({
          children: [new TextRun({ text: line || ' ' })],
        })
      );
      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
      }
      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      });
      const buffer = await Packer.toBuffer(doc);
      const filename = 'assignment-response.docx';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
      return;
    }
  } catch (error) {
    console.error('AI export-response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export response',
    });
  }
});

module.exports = router;
