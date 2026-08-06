'use client';
import React, { useState } from 'react';
import { AIEvaluationResult } from '../types';
import { ShieldCheck, ThumbsUp, HelpCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { AiMessage } from './ui/AiMessage';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge, statusBadgeTone } from './ui/Badge';

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

  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title="AI Submission Evaluation Report"
      description="Gemini 3.6 Flash · SkillForge AI Rubric Engine"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="space-y-6 -mt-1">
        <div className="bg-sf-surface-2 p-5 rounded-2xl border border-sf flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sf-muted">
              Overall assessment
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-sf">{evaluation.overallScore}</span>
              <span className="text-sm text-sf-muted font-bold">/ {evaluation.maxScore} pts</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusBadgeTone(evaluation.suggestedGrade)}>
              {evaluation.suggestedGrade.replace(/_/g, ' ')}
            </Badge>
            {isInstructor && onOverrideGrade && !isOverriding ? (
              <Button size="sm" variant="secondary" onClick={() => setIsOverriding(true)}>
                <Edit3 className="w-3.5 h-3.5" />
                Override
              </Button>
            ) : null}
          </div>
        </div>

        {isOverriding ? (
          <form
            onSubmit={handleSaveOverride}
            className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-3"
          >
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Instructor override</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-sf font-medium mb-1">Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-sf-surface border border-sf rounded-lg min-h-10"
                />
              </div>
              <div>
                <label className="block text-xs text-sf font-medium mb-1">Note</label>
                <input
                  type="text"
                  placeholder="Rationale…"
                  value={overrideFeedback}
                  onChange={(e) => setOverrideFeedback(e.target.value)}
                  className="w-full text-xs p-2 bg-sf-surface border border-sf rounded-lg min-h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOverriding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save override
              </Button>
            </div>
          </form>
        ) : null}

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-sf-muted uppercase tracking-wider">Executive summary</h4>
          <AiMessage content={evaluation.summary} />
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-sf-muted uppercase tracking-wider">Rubric breakdown</h4>
          <div className="space-y-2">
            {evaluation.rubricScores?.map((rub, i) => (
              <div key={i} className="p-3.5 bg-sf-surface rounded-xl border border-sf text-xs space-y-1">
                <div className="flex justify-between font-bold text-sf">
                  <span>{rub.rubricTitle}</span>
                  <span className="text-indigo-600">
                    {rub.score} / {rub.maxPoints}
                  </span>
                </div>
                <p className="text-sf-muted text-[11px] leading-relaxed">{rub.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900 space-y-2">
            <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center">
              <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
              Strengths
            </h5>
            <ul className="space-y-1 text-xs text-emerald-800 dark:text-emerald-200 list-disc list-inside">
              {evaluation.strengths?.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900 space-y-2">
            <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Improvements
            </h5>
            <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200 list-disc list-inside">
              {evaluation.areasForImprovement?.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
          <h5 className="text-xs font-bold text-indigo-300 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
            Security & best practices
          </h5>
          <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
            {evaluation.securityAndBestPractices?.map((sec, idx) => (
              <li key={idx}>{sec}</li>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
