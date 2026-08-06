'use client';
import React, { useState } from 'react';
import { Course } from '../types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import Select from './ui/Select';
import { Sparkles, CheckCircle2, Layers, Code, AlertCircle, RefreshCw } from 'lucide-react';
import { PageHero } from './ui/PageHero';
import { AiLoadingBubble, AiMessage } from './ui/AiMessage';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface AICurriculumGeneratorProps {
  onCourseGeneratedAndSaved: (newCourse: Course) => void;
  onCancel: () => void;
}

export default function AICurriculumGenerator({
  onCourseGeneratedAndSaved,
  onCancel,
}: AICurriculumGeneratorProps) {
  const { currentUser } = useAuth();
  const [topicPrompt, setTopicPrompt] = useState('');
  const [targetLevel, setTargetLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [targetCategory, setTargetCategory] = useState('Next.js & Frontend');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<Partial<Course> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topicPrompt.trim()) return;

    setErrorMsg('');
    setIsGenerating(true);
    setGeneratedCourse(null);

    try {
      const data = await api<Partial<Course>>('/api/ai/generate-course', {
        method: 'POST',
        body: JSON.stringify({
          topicPrompt,
          targetLevel,
          targetCategory,
        }),
      });
      setGeneratedCourse(data);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate course outline via AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedCourse = () => {
    if (!generatedCourse || !generatedCourse.title) return;

    const fullCourse: Course = {
      id: `course_ai_${Date.now()}`,
      title: generatedCourse.title,
      slug: generatedCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: generatedCourse.description || '',
      category: generatedCourse.category || targetCategory,
      level: (generatedCourse.level as any) || targetLevel,
      instructorId: currentUser?.id || 'user_instructor_1',
      instructorName: currentUser?.name || 'AI Architect',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      status: 'PUBLISHED',
      enrolledStudentsCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: generatedCourse.modules || [],
      assignments: generatedCourse.assignments || [],
    };

    onCourseGeneratedAndSaved(fullCourse);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHero
        tone="violet"
        eyebrow={
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Gemini 3.6 Flash
          </>
        }
        title="AI Curriculum Architect"
        description="Describe a skill domain. Gemini designs a full course outline with modules, lessons, challenges, and rubrics."
        icon={<Sparkles className="w-72 h-72 text-indigo-300" />}
      />

      <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-sf mb-1">Course Topic or Prompt Idea</label>
            <input
              type="text"
              required
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              className="w-full text-sm p-3 border border-sf rounded-xl bg-sf-surface text-sf focus:ring-2 focus:ring-indigo-500/30 outline-none min-h-11"
              placeholder="e.g. Next.js App Router, RSC, and Server Actions Masterclass"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-sf mb-1">Category Domain</label>
              <Select
                value={targetCategory}
                onChange={setTargetCategory}
                aria-label="Category domain"
                options={[
                  { value: 'Next.js & Frontend', label: 'Next.js & Frontend' },
                  { value: 'Backend & Node.js', label: 'Backend & Node.js' },
                  { value: 'Databases & System Design', label: 'Databases & System Design' },
                  { value: 'General Tech', label: 'General Tech' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sf mb-1">Target Skill Level</label>
              <Select
                value={targetLevel}
                onChange={(v) => setTargetLevel(v as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')}
                aria-label="Target skill level"
                options={[
                  { value: 'BEGINNER', label: 'Beginner' },
                  { value: 'INTERMEDIATE', label: 'Intermediate' },
                  { value: 'ADVANCED', label: 'Advanced' },
                ]}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating} loading={isGenerating}>
              {isGenerating ? 'Structuring curriculum…' : 'Generate Full Curriculum'}
              {!isGenerating ? <Sparkles className="w-4 h-4" /> : null}
            </Button>
          </div>
        </form>
      </div>

      {isGenerating ? (
        <div className="space-y-3">
          <AiLoadingBubble label="Gemini is structuring your curriculum…" />
          <div className="rounded-2xl border border-sf bg-sf-surface p-4 space-y-2">
            <div className="h-3 rounded-full ai-shimmer w-1/3" />
            <div className="h-3 rounded-full ai-shimmer w-full" />
            <div className="h-3 rounded-full ai-shimmer w-5/6" />
            <div className="h-24 rounded-xl ai-shimmer w-full mt-3" />
          </div>
        </div>
      ) : null}

      {generatedCourse && (
        <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-indigo-200 dark:border-indigo-900 shadow-sf-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sf pb-4">
            <div>
              <Badge tone="success">AI Course Preview Ready</Badge>
              <h3 className="text-xl font-bold text-sf mt-2">{generatedCourse.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleGenerate()}>
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveGeneratedCourse}
              >
                <CheckCircle2 className="w-4 h-4" />
                Publish to Catalog
              </Button>
            </div>
          </div>

          <AiMessage content={generatedCourse.description || ''} />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sf-muted uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
              Generated Modules ({generatedCourse.modules?.length})
            </h4>
            <div className="space-y-3">
              {generatedCourse.modules?.map((mod, i) => (
                <div key={i} className="p-4 bg-sf-surface-2 rounded-xl border border-sf text-xs space-y-2">
                  <h5 className="font-bold text-sf">{mod.title}</h5>
                  <p className="text-sf-muted">{mod.description}</p>
                  <div className="pl-3 border-l-2 border-indigo-300 space-y-1 pt-1">
                    {mod.lessons?.map((les, j) => (
                      <div key={j} className="flex justify-between text-sf">
                        <span>• {les.title}</span>
                        <span className="font-mono text-sf-muted">{les.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sf-muted uppercase tracking-wider flex items-center">
              <Code className="w-4 h-4 mr-1.5 text-indigo-600" />
              Coding Challenges ({generatedCourse.assignments?.length})
            </h4>
            <div className="space-y-3">
              {generatedCourse.assignments?.map((assign, i) => (
                <div
                  key={i}
                  className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs space-y-2"
                >
                  <div className="flex justify-between font-bold text-sf">
                    <span>{assign.title}</span>
                    <span>Max: {assign.maxScore}</span>
                  </div>
                  <p className="text-sf-muted">{assign.description}</p>
                  <div className="bg-sf-surface p-3 rounded-lg border border-sf space-y-1">
                    <span className="text-[10px] font-bold text-sf-muted uppercase">Rubric</span>
                    {assign.rubrics?.map((rub, k) => (
                      <div key={k} className="flex justify-between text-sf-muted text-[11px]">
                        <span>
                          - {rub.title}: {rub.description}
                        </span>
                        <span className="font-bold text-indigo-600">{rub.maxPoints} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
