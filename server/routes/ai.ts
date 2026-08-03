import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { Submission } from '../models/Submission';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });
}

router.post(
  '/generate-course',
  authenticate,
  requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'),
  async (req: Request, res: Response) => {
    try {
      const { topicPrompt, targetLevel, targetCategory } = req.body;
      if (!topicPrompt) {
        return res.status(400).json({ error: 'Topic prompt is required' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({ error: 'Gemini API Key is not configured in server environment.' });
      }

      const systemPrompt = `You are an elite EdTech Curriculum Architect for House of EdTech.
Create a detailed, highly technical, and production-ready course outline based on the user request.
The target level is ${targetLevel || 'ADVANCED'} and category is ${targetCategory || 'Next.js & Frontend'}.

Return strict JSON matching this structure:
{
  "title": "Course Title",
  "description": "Comprehensive overview explaining why this course is impactful",
  "category": "Category Name",
  "level": "BEGINNER|INTERMEDIATE|ADVANCED",
  "modules": [
    {
      "title": "Module 1: Title",
      "description": "Module overview",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "In-depth instructional text and explanations",
          "durationMinutes": 20,
          "type": "TEXT"
        }
      ]
    }
  ],
  "assignments": [
    {
      "title": "Assignment Title",
      "description": "In-depth problem statement requiring student implementation",
      "type": "CODE",
      "programmingLanguage": "typescript",
      "starterCode": "// Starter boilerplate code...",
      "maxScore": 100,
      "rubrics": [
        { "title": "Rubric Category 1", "description": "Criteria detail", "maxPoints": 30 },
        { "title": "Rubric Category 2", "description": "Criteria detail", "maxPoints": 35 },
        { "title": "Rubric Category 3", "description": "Criteria detail", "maxPoints": 35 }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Generate an EdTech course curriculum for topic: "${topicPrompt}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              level: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    lessons: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          content: { type: Type.STRING },
                          durationMinutes: { type: Type.INTEGER },
                          type: { type: Type.STRING },
                        },
                        required: ['title', 'content', 'durationMinutes', 'type'],
                      },
                    },
                  },
                  required: ['title', 'description', 'lessons'],
                },
              },
              assignments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING },
                    programmingLanguage: { type: Type.STRING },
                    starterCode: { type: Type.STRING },
                    maxScore: { type: Type.INTEGER },
                    rubrics: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          maxPoints: { type: Type.INTEGER },
                        },
                        required: ['title', 'description', 'maxPoints'],
                      },
                    },
                  },
                  required: ['title', 'description', 'type', 'maxScore', 'rubrics'],
                },
              },
            },
            required: ['title', 'description', 'category', 'level', 'modules', 'assignments'],
          },
        },
      });

      const generatedData = JSON.parse(response.text || '{}');
      res.json(generatedData);
    } catch (err: any) {
      console.error('AI Course Generation Error:', err);
      res.status(500).json({ error: 'Failed to generate course with AI', message: err.message });
    }
  }
);

router.post(
  '/evaluate-submission',
  authenticate,
  requireRoles('STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const {
        submissionId,
        codeContent,
        essayContent,
        assignmentTitle,
        assignmentDescription,
        rubrics,
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({ error: 'Gemini API Key is not configured in server environment.' });
      }

      const payloadText = codeContent
        ? `[CODE SUBMISSION]:\n${codeContent}`
        : `[ESSAY SUBMISSION]:\n${essayContent}`;

      const systemPrompt = `You are a Senior Full-Stack Technical Lead & Academic Evaluator at House of EdTech.
Your job is to thoroughly evaluate the candidate's submission for the assignment: "${assignmentTitle}".
Assignment Context: ${assignmentDescription || 'Assess production readiness, security, sanitization, and architectural quality.'}

Evaluate the code or essay rigorously according to the provided rubrics.
Check for:
1. Security vulnerabilities, missing input validation or sanitization.
2. Architecture, modern Next.js 16 or Node.js best practices, type safety.
3. Performance, async/stream efficiency, edge cases.

Return strict JSON matching this structure:
{
  "overallScore": 92,
  "maxScore": 100,
  "summary": "Concise high-level summary of candidate performance",
  "strengths": ["Strength 1", "Strength 2"],
  "areasForImprovement": ["Improvement point 1", "Improvement point 2"],
  "securityAndBestPractices": ["Security audit point 1", "Best practice point 2"],
  "suggestedGrade": "PASS",
  "rubricScores": [
    {
      "rubricTitle": "Security & Auth Verification",
      "score": 28,
      "maxPoints": 30,
      "feedback": "Specific feedback for this rubric"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Evaluate this submission:\n\n${payloadText}\n\nRubric criteria list: ${JSON.stringify(rubrics || [])}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const evaluation = JSON.parse(response.text || '{}');
      evaluation.reviewedAt = new Date().toISOString();

      if (submissionId) {
        const submission = await Submission.findById(submissionId);
        if (submission) {
          if (
            req.user!.role === 'STUDENT' &&
            submission.studentId !== req.user!.id
          ) {
            return res.status(403).json({ error: 'Cannot evaluate another student submission' });
          }
          submission.aiEvaluation = evaluation;
          submission.status = 'AI_EVALUATED';
          submission.finalScore = evaluation.overallScore;
          await submission.save();
        }
      }

      res.json(evaluation);
    } catch (err: any) {
      console.error('AI Evaluation Error:', err);
      res.status(500).json({ error: 'Failed to evaluate submission', message: err.message });
    }
  }
);

router.post('/tutor-chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { prompt, courseContext, lessonTitle } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key is missing.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Course: ${courseContext || 'Next.js 16 Fullstack'}. Current Lesson: ${lessonTitle || 'General'}.\nStudent question: ${prompt}`,
      config: {
        systemInstruction:
          'You are an expert interactive AI Teaching Assistant for House of EdTech. Provide clear, encouraging, technically accurate answers with short TypeScript code examples where helpful.',
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    res.status(500).json({ error: 'Tutor chat error', message: err.message });
  }
});

export default router;
