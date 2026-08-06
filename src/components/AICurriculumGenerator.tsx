'use client';
import React, { useState } from 'react';
import { Course } from '../types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { Sparkles, ArrowRight, CheckCircle2, Layers, BookOpen, Code, AlertCircle, RefreshCw } from 'lucide-react';

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate course outline via AI.');
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
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">AI Curriculum Architect</h2>
            <p className="text-xs text-indigo-200">Powered by Gemini 3.6 Flash &bull; House of EdTech Add-On Feature</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Specify a technical topic or skill domain. Gemini AI will automatically design a complete production course outline with modules, lessons, exercise challenges, and evaluation rubrics.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Topic or Prompt Idea
            </label>
            <input
              type="text"
              required
              value={topicPrompt}
              onChange={e => setTopicPrompt(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Next.js 16 App Router, RSC, and Server Actions Masterclass"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Domain</label>
              <select
                value={targetCategory}
                onChange={e => setTargetCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="Next.js & Frontend">Next.js & Frontend</option>
                <option value="Backend & Node.js">Backend & Node.js</option>
                <option value="Databases & System Design">Databases & System Design</option>
                <option value="General Tech">General Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Skill Level</label>
              <select
                value={targetLevel}
                onChange={e => setTargetLevel(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI is Structuring Curriculum...</span>
                </>
              ) : (
                <>
                  <span>Generate Full Curriculum</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Course Preview */}
      {generatedCourse && (
        <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                AI Course Preview Ready
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{generatedCourse.title}</h3>
            </div>

            <button
              onClick={handleSaveGeneratedCourse}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Course to Catalog (CRUD Save)</span>
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {generatedCourse.description}
          </p>

          {/* Generated Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
              Generated Modules ({generatedCourse.modules?.length})
            </h4>

            <div className="space-y-3">
              {generatedCourse.modules?.map((mod, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h5 className="font-bold text-slate-900">{mod.title}</h5>
                  <p className="text-slate-600">{mod.description}</p>
                  
                  <div className="pl-3 border-l-2 border-indigo-300 space-y-1 pt-1">
                    {mod.lessons?.map((les, j) => (
                      <div key={j} className="flex justify-between text-slate-700">
                        <span>&bull; {les.title}</span>
                        <span className="font-mono text-slate-400">{les.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Assignments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Code className="w-4 h-4 mr-1.5 text-indigo-600" />
              Generated Coding Challenges & Rubrics ({generatedCourse.assignments?.length})
            </h4>

            <div className="space-y-3">
              {generatedCourse.assignments?.map((assign, i) => (
                <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-indigo-950">
                    <span>{assign.title}</span>
                    <span>Max Points: {assign.maxScore}</span>
                  </div>
                  <p className="text-slate-700">{assign.description}</p>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Rubric Criteria</span>
                    {assign.rubrics?.map((rub, k) => (
                      <div key={k} className="flex justify-between text-slate-600 text-[11px]">
                        <span>- {rub.title}: {rub.description}</span>
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
