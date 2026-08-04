import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withDb } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Submission } from '@/server/models/Submission';

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

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireRoles(req, 'STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN');
      if ('error' in auth) return auth.error;

      const {
        submissionId,
        codeContent,
        essayContent,
        assignmentTitle,
        assignmentDescription,
        rubrics,
      } = await req.json();

      const ai = getGeminiClient();
      if (!ai) {
        return NextResponse.json(
          { error: 'Gemini API Key is not configured in server environment.' },
          { status: 503 }
        );
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
          if (auth.user.role === 'STUDENT' && submission.studentId !== auth.user.id) {
            return NextResponse.json(
              { error: 'Cannot evaluate another student submission' },
              { status: 403 }
            );
          }
          submission.aiEvaluation = evaluation;
          submission.status = 'AI_EVALUATED';
          submission.finalScore = evaluation.overallScore;
          await submission.save();
        }
      }

      return NextResponse.json(evaluation);
    } catch (err: unknown) {
      console.error('AI Evaluation Error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to evaluate submission', message },
        { status: 500 }
      );
    }
  });
}
