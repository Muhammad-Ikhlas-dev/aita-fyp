const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Quiz = require("../schemas/Quiz");
const QuizSubmission = require("../schemas/QuizSubmission");
const { generateAIContent } = require("../services/aiService");

// 1. GENERATE QUIZ CONTENT (AI Powered)
router.post("/generate", async (req, res) => {
  try {
    const { instructions, difficulty, questionCount = 5, quizType } = req.body;
    const prompt = `
      Instructions: Generate a quiz about ${instructions}.
      Difficulty: ${difficulty || "medium"}.
      Count: ${questionCount}.
      Type: ${quizType || "mcq and short"}.
      Format: JSON array of objects. Each object must have:
      questionText (string),
      type ("mcq" or "short"),
      options (array of 4 strings for mcq, empty for short),
      correctAnswer (string),
      points (number).
      Return only JSON, no markdown, no extra text.
    `;

    let aiRawResponse = await generateAIContent(prompt);
    let jsonMatch = aiRawResponse.match(/\[.*\]/s);
    if (!jsonMatch) return res.status(500).json({ success: false, message: "AI error. Try again." });

    let questions = JSON.parse(jsonMatch[0]);
    const finalQuestions = Array.from({ length: questionCount }).map((_, idx) => {
      const q = questions[idx] || {};
      return {
        questionText: q.questionText || `Question ${idx + 1}`,
        type: q.type || (quizType === "short" ? "short" : "mcq"),
        options: q.type === "mcq" ? (q.options || ["A", "B", "C", "D"]) : [],
        correctAnswer: q.correctAnswer || "A",
        points: q.points || 1,
      };
    });

    res.json({ success: true, questions: finalQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. PUBLISH QUIZ
router.post("/", async (req, res) => {
  try {
    const { title, description, deadline, timeLimit, classIds, createdBy, questions, quizType } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      deadline: new Date(deadline),
      timeLimit: parseInt(timeLimit),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      classIds: classIds.map((id) => new mongoose.Types.ObjectId(id)),
      questions,
      quizType,
    });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET ALL QUIZZES (WITH STUDENT SUBMISSION STATUS)
router.get("/", async (req, res) => {
  try {
    const { classId, createdBy, studentId } = req.query;
    const filter = {};

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.classIds = { $in: [new mongoose.Types.ObjectId(classId)] };
    }
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();

    // Attach submission status for the student
    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        let submission = null;
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
          submission = await QuizSubmission.findOne({
            quizId: quiz._id,
            studentId: new mongoose.Types.ObjectId(studentId),
          }).select("score totalPoints status submittedAt");
        }
        return { ...quiz, submission };
      })
    );

    res.json({ success: true, quizzes: quizzesWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET SINGLE QUIZ (For TakeQuiz page)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. SUBMIT QUIZ
router.post("/submit", async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;

    // Check for existing submission
    const existing = await QuizSubmission.findOne({ quizId, studentId });
    if (existing) return res.status(400).json({ success: false, message: "Already submitted" });

    const quiz = await Quiz.findById(quizId);
    let score = 0;
    let totalPoints = 0;
    let needsAiGrading = false;

    const processedAnswers = answers.map((ans) => {
      const q = quiz.questions.id(ans.questionId);
      totalPoints += q.points;
      let isCorrect = false;
      if (q.type === "mcq") {
        isCorrect = ans.studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        if (isCorrect) score += q.points;
      } else {
        needsAiGrading = true;
      }
      return { ...ans, isCorrect };
    });

    const submission = await QuizSubmission.create({
      quizId,
      studentId: new mongoose.Types.ObjectId(studentId),
      answers: processedAnswers,
      score,
      totalPoints,
      status: needsAiGrading ? "pending" : "graded",
    });

    res.status(201).json({ success: true, submission, needsAiGrading });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. AI GRADING
router.post("/ai-grade", async (req, res) => {
  try {
    const { submissionId } = req.body;
    const submission = await QuizSubmission.findById(submissionId).populate("quizId");
    if (!submission) return res.status(404).json({ success: false, message: "Not found" });

    const quiz = submission.quizId;
    let additionalScore = 0;

    for (let i = 0; i < submission.answers.length; i++) {
      const studentAns = submission.answers[i];
      const originalQ = quiz.questions.id(studentAns.questionId);

      if (originalQ.type === "short") {
        const prompt = ` Grade this: Q: ${originalQ.questionText}, Ref: ${originalQ.correctAnswer}, Student: ${studentAns.studentAnswer}. Max Pts: ${originalQ.points}. Return JSON {"score": number, "feedback": "string"}`;
        const aiResultRaw = await generateAIContent(prompt);
        const aiResult = JSON.parse(aiResultRaw.replace(/```json|```/g, "").trim());
        
        submission.answers[i].isCorrect = aiResult.score >= originalQ.points / 2;
        submission.answers[i].aiFeedback = aiResult.feedback;
        additionalScore += aiResult.score;
      }
    }

    submission.score += additionalScore;
    submission.status = "graded";
    await submission.save();

    res.json({ success: true, finalScore: submission.score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;