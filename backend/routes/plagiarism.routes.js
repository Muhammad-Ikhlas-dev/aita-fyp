const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const { extractText } = require('unpdf');

const AssignmentSubmission = require('../schemas/AssignmentSubmission');
const Assignment = require('../schemas/Assignment');

const router = express.Router();

// ── Text extraction helpers ──────────────────────────────────────────────────

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);
  const { text } = await extractText(uint8, { mergePages: true });
  return Array.isArray(text) ? text.join(' ') : (text || '');
}

async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    }
    if (
      ext === '.docx' ||
      ext === '.doc' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await extractTextFromDOCX(filePath);
    }
    // Plain text fallback
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Text extraction failed for ${filePath}:`, err.message);
    return '';
  }
}

// ── Similarity helpers ───────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2); // skip very short words
}

function buildTermFreq(tokens) {
  const freq = {};
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }
  return freq;
}

function cosineSimilarity(freqA, freqB) {
  const keysA = new Set(Object.keys(freqA));
  const keysB = new Set(Object.keys(freqB));
  const allKeys = new Set([...keysA, ...keysB]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const k of allKeys) {
    const a = freqA[k] || 0;
    const b = freqB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── Route ────────────────────────────────────────────────────────────────────

// POST /api/plagiarism/check?assignmentId=xxx
// Checks all submissions for an assignment for plagiarism (pairwise cosine similarity)
router.post('/check', async (req, res) => {
  try {
    const assignmentId = req.query.assignmentId || req.body.assignmentId;

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Valid assignmentId is required' });
    }

    // Load assignment
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Load all submissions for this assignment with student info
    const submissions = await AssignmentSubmission.find({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
    })
      .populate('studentId', 'fullName email')
      .lean();

    if (submissions.length < 2) {
      return res.json({
        success: true,
        assignmentTitle: assignment.title,
        message: 'Need at least 2 submissions to check for plagiarism.',
        results: [],
        studentSummary: [],
      });
    }

    // Extract text from each submission
    const docs = [];
    for (const sub of submissions) {
      const filePath = path.isAbsolute(sub.filePath)
        ? sub.filePath
        : path.join(__dirname, '..', sub.filePath);

      if (!fs.existsSync(filePath)) {
        docs.push({
          submissionId: sub._id,
          studentName: sub.studentId?.fullName || 'Unknown',
          email: sub.studentId?.email || '',
          originalName: sub.originalName,
          text: '',
          tokens: [],
          termFreq: {},
          tokenCount: 0,
        });
        continue;
      }

      const raw = await extractTextFromFile(filePath, sub.mimeType);
      const tokens = tokenize(raw);
      docs.push({
        submissionId: sub._id,
        studentName: sub.studentId?.fullName || 'Unknown',
        email: sub.studentId?.email || '',
        originalName: sub.originalName,
        text: raw,
        tokens,
        termFreq: buildTermFreq(tokens),
        tokenCount: tokens.length,
      });
    }

    // Compute pairwise similarity
    const pairs = [];
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const a = docs[i];
        const b = docs[j];

        let similarity = 0;
        if (a.tokenCount > 0 && b.tokenCount > 0) {
          similarity = cosineSimilarity(a.termFreq, b.termFreq);
        }

        const pct = Math.round(similarity * 100);
        const level =
          pct >= 70 ? 'high' :
          pct >= 40 ? 'medium' : 'low';

        pairs.push({
          studentA: { name: a.studentName, email: a.email, submissionId: a.submissionId },
          studentB: { name: b.studentName, email: b.email, submissionId: b.submissionId },
          similarityPercent: pct,
          level,
        });
      }
    }

    // Sort pairs by similarity descending
    pairs.sort((a, b) => b.similarityPercent - a.similarityPercent);

    // Per-student summary: highest similarity with any other student
    const studentMaxSim = {};
    for (const p of pairs) {
      const ka = String(p.studentA.submissionId);
      const kb = String(p.studentB.submissionId);
      if (!studentMaxSim[ka] || p.similarityPercent > studentMaxSim[ka].maxSimilarity) {
        studentMaxSim[ka] = {
          studentName: p.studentA.name,
          email: p.studentA.email,
          submissionId: p.studentA.submissionId,
          maxSimilarity: p.similarityPercent,
          mostSimilarTo: p.studentB.name,
          level: p.level,
        };
      }
      if (!studentMaxSim[kb] || p.similarityPercent > studentMaxSim[kb].maxSimilarity) {
        studentMaxSim[kb] = {
          studentName: p.studentB.name,
          email: p.studentB.email,
          submissionId: p.studentB.submissionId,
          maxSimilarity: p.similarityPercent,
          mostSimilarTo: p.studentA.name,
          level: p.level,
        };
      }
    }

    const studentSummary = Object.values(studentMaxSim).sort(
      (a, b) => b.maxSimilarity - a.maxSimilarity
    );

    res.json({
      success: true,
      assignmentTitle: assignment.title,
      totalSubmissions: submissions.length,
      results: pairs,
      studentSummary,
    });
  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check plagiarism',
    });
  }
});

module.exports = router;
