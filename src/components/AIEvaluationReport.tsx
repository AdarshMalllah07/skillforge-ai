'use client';
import React, { useState } from 'react';
import { AIEvaluationResult } from '../types';
import { X, Sparkles, CheckCircle, AlertTriangle, ShieldCheck, Award, ThumbsUp, HelpCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface AIEvaluationReportProps {
  evaluation: AIEvaluationResult;
  onClose: () => void;
  onOverrideGrade?: (newScore: number, feedback: string) => void;
}

export default function AIEvaluationReport({
  evaluation,
  onClose,
  onOverrideGrade,
}: AIEvaluationReportProps) {
  const { currentUser } = useAuth();
  const isInstructor = currentUser?.role === 'INSTRUCTOR' || currentUser?.role === 'EVALUATOR' || currentUser?.role === 'ADMIN';

  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideScore, setOverrideScore] = useState(evaluation.overallScore);
  const [overrideFeedback, setOverrideFeedback] = useState('');

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOverrideGrade) {
      onOverrideGrade(overrideScore, overrideFeedback);
    }
    setIsOverriding(false);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'PASS':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'NEEDS_REVISION':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'FAIL':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Submission Evaluation Report</h3>
              <p className="text-xs text-indigo-200">Powered by Gemini 3.6 Flash &bull; House of EdTech Rubric Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Top Score Banner */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Overall Candidate Assessment
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-black text-slate-900">{evaluation.overallScore}</span>
                <span className="text-sm text-slate-500 font-bold">/ {evaluation.maxScore} pts</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getGradeColor(evaluation.suggestedGrade)}`}>
                RECOMMENDED GRADE: {evaluation.suggestedGrade}
              </span>

              {isInstructor && onOverrideGrade && !isOverriding && (
                <button
                  onClick={() => setIsOverriding(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-600 border border-slate-300 rounded-lg shadow-2xs flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Manual Override</span>
                </button>
              )}
            </div>
          </div>

          {/* Instructor Grade Override Form */}
          {isOverriding && (
            <form onSubmit={handleSaveOverride} className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900">Instructor Grade Override</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 font-medium">Adjust Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideScore}
                    onChange={e => setOverrideScore(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium">Instructor Note</label>
                  <input
                    type="text"
                    placeholder="Provide evaluation rationale..."
                    value={overrideFeedback}
                    onChange={e => setOverrideFeedback(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOverriding(false)}
                  className="px-3 py-1 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                >
                  Save Override
                </button>
              </div>
            </form>
          )}

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Summary</h4>
            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-medium">
              {evaluation.summary}
            </p>
          </div>

          {/* Rubric Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rubric Criteria Score Breakdown
            </h4>
            <div className="space-y-2">
              {evaluation.rubricScores?.map((rub, i) => (
                <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs flex flex-col space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{rub.rubricTitle}</span>
                    <span className="text-indigo-600">{rub.score} / {rub.maxPoints} pts</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{rub.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2">
              <h5 className="text-xs font-bold text-emerald-900 flex items-center">
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Key Architectural Strengths
              </h5>
              <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                {evaluation.strengths?.map((str, idx) => (
                  <li key={idx} className="leading-relaxed">{str}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
              <h5 className="text-xs font-bold text-amber-900 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Areas for Improvement
              </h5>
              <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                {evaluation.areasForImprovement?.map((area, idx) => (
                  <li key={idx} className="leading-relaxed">{area}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Security & Best Practices Audit */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
            <h5 className="text-xs font-bold text-indigo-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
              Security & Best Practices Audit
            </h5>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {evaluation.securityAndBestPractices?.map((sec, idx) => (
                <li key={idx} className="leading-relaxed">{sec}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
