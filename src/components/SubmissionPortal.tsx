import React, { useState } from 'react';
import { Assignment, Course, Submission, AIEvaluationResult } from '../types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { ArrowLeft, Code, Send, Sparkles, CheckCircle2, RotateCcw, AlertCircle, FileText, Github, ShieldCheck } from 'lucide-react';
import AIEvaluationReport from './AIEvaluationReport';

interface SubmissionPortalProps {
  assignment: Assignment;
  course: Course;
  onBack: () => void;
  onSubmissionSuccess: (newSubmission: Submission) => void;
}

export default function SubmissionPortal({
  assignment,
  course,
  onBack,
  onSubmissionSuccess,
}: SubmissionPortalProps) {
  const { currentUser } = useAuth();
  
  const [codeContent, setCodeContent] = useState(assignment.starterCode || '');
  const [essayContent, setEssayContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<AIEvaluationResult | null>(null);
  const [submittedItem, setSubmittedItem] = useState<Submission | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetCode = () => {
    setCodeContent(assignment.starterCode || '');
  };

  const handleSubmitAndEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignment.type === 'CODE' && !codeContent.trim()) {
      setErrorMessage('Please write or paste code before submitting.');
      return;
    }
    if (assignment.type === 'ESSAY' && !essayContent.trim()) {
      setErrorMessage('Please write your essay content before submitting.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    setIsEvaluating(true);

    try {
      // 1. Post submission to backend
      const submissionData = await api<Submission>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          courseId: course.id,
          courseTitle: course.title,
          codeContent: assignment.type === 'CODE' ? codeContent : undefined,
          essayContent: assignment.type === 'ESSAY' ? essayContent : undefined,
          repositoryUrl: repoUrl || undefined,
          maxScore: assignment.maxScore,
        }),
      });

      setSubmittedItem(submissionData);

      // 2. Trigger Server-side AI Evaluation using Gemini
      const evalData = await api<AIEvaluationResult>('/api/ai/evaluate-submission', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: submissionData.id,
          codeContent: submissionData.codeContent,
          essayContent: submissionData.essayContent,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          rubrics: assignment.rubrics,
        }),
      });

      setLatestEvaluation(evalData);

      const finalSubmission: Submission = {
        ...submissionData,
        status: 'AI_EVALUATED',
        aiEvaluation: evalData,
        finalScore: evalData.overallScore,
      };

      onSubmissionSuccess(finalSubmission);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred during submission and AI evaluation.');
    } finally {
      setIsSubmitting(false);
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Course
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Student Workspace &bull; {currentUser?.name}</span>
        </div>
      </div>

      {/* Assignment Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
            {assignment.type} Submission
          </span>
          <span className="text-xs font-bold text-slate-800">
            Max Score: {assignment.maxScore} points
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">{assignment.title}</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{assignment.description}</p>

        {/* Rubrics Checklist */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Grading Rubric Criteria
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assignment.rubrics.map(rub => (
              <div key={rub.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{rub.title}</span>
                  <span className="text-indigo-600">{rub.maxPoints} pts</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{rub.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submission Editor Workspace */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              {assignment.type === 'CODE' ? 'TypeScript Code Editor' : 'Essay Response Workspace'}
            </span>
          </div>

          {assignment.type === 'CODE' && (
            <button
              onClick={handleResetCode}
              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Starter Code</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-900/50 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {assignment.type === 'CODE' ? (
          <div>
            <textarea
              rows={14}
              value={codeContent}
              onChange={e => setCodeContent(e.target.value)}
              className="w-full font-mono text-xs p-4 bg-slate-950 text-indigo-200 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              placeholder="// Write your TypeScript / Next.js implementation here..."
            />
          </div>
        ) : (
          <div>
            <textarea
              rows={10}
              value={essayContent}
              onChange={e => setEssayContent(e.target.value)}
              className="w-full text-xs p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              placeholder="Write your architectural analysis or essay response here..."
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Optional GitHub Repository URL
          </label>
          <div className="relative">
            <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              placeholder="https://github.com/username/project-repo"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center">
            <Sparkles className="w-4 h-4 text-indigo-400 mr-1.5 animate-pulse" />
            Grading powered by server-side Gemini 3.6 Flash AI Evaluator
          </div>

          <button
            onClick={handleSubmitAndEvaluate}
            disabled={isSubmitting || isEvaluating}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Evaluating with AI...</span>
            ) : (
              <>
                <span>Submit Work & AI Evaluate</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Result Modal display if evaluated */}
      {latestEvaluation && (
        <AIEvaluationReport
          evaluation={latestEvaluation}
          onClose={() => setLatestEvaluation(null)}
        />
      )}

    </div>
  );
}
