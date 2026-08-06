import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withApi } from '@/lib/server/api';
import { requireAuth } from '@/server/middleware/auth';

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
  return withApi(req, async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const { prompt, courseContext, lessonTitle } = await req.json();
      const ai = getGeminiClient();
      if (!ai) {
        return NextResponse.json({ error: 'Gemini API Key is missing.' }, { status: 503 });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Course: ${courseContext || 'Next.js 16 Fullstack'}. Current Lesson: ${lessonTitle || 'General'}.\nStudent question: ${prompt}`,
        config: {
          systemInstruction:
            'You are an expert interactive AI Teaching Assistant for SkillForge AI. Provide clear, encouraging, technically accurate answers with short TypeScript code examples where helpful.',
        },
      });

      return NextResponse.json({ reply: response.text });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Tutor chat error', message }, { status: 500 });
    }
  });
}
