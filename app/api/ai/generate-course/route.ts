import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';

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
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN', 'EVALUATOR');
      if ('error' in auth) return auth.error;

      const { topicPrompt, targetLevel, targetCategory } = await req.json();
      if (!topicPrompt) {
        return NextResponse.json({ error: 'Topic prompt is required' }, { status: 400 });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return NextResponse.json(
          { error: 'Gemini API Key is not configured in server environment.' },
          { status: 503 }
        );
      }

      const systemPrompt = `You are an elite EdTech Curriculum Architect for SkillForge AI.
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
      return NextResponse.json(generatedData);
    } catch (err: unknown) {
      console.error('AI Course Generation Error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to generate course with AI', message },
        { status: 500 }
      );
    }
  });
}
