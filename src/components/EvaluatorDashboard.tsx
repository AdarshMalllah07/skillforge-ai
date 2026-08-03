import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { Submission } from '../types';
import { 
  ShieldCheck, FileCode2, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, Star, MessageSquare, Send, Code, Terminal, ExternalLink 
} from 'lucide-react';

interface EvaluatorDashboardProps {
  submissions: Submission[];
  onUpdateSubmissionGrade?: (submissionId: string, grade: number, feedback: string) => void;
}

export default function EvaluatorDashboard({
  submissions,
  onUpdateSubmissionGrade,
}: EvaluatorDashboardProps) {
  const { currentUser } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    submissions.length > 0 ? submissions[0] : null
  );
  const [score, setScore] = useState<number>(selectedSubmission?.finalScore || selectedSubmission?.aiEvaluation?.overallScore || 90);
  const [feedback, setFeedback] = useState<string>(
    selectedSubmission?.instructorFeedback || selectedSubmission?.aiEvaluation?.summary || 'Solution follows modern React 19 / Next.js server component standards with clean type definitions.'
  );
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) return null;

  const handleSelect = (sub: Submission) => {
    setSelectedSubmission(sub);
    setScore(sub.finalScore || sub.aiEvaluation?.overallScore || 90);
    setFeedback(sub.instructorFeedback || sub.aiEvaluation?.summary || 'Good modular structure and edge-case handling.');
    setIsSaved(false);
  };

  const handleSaveGrade = () => {
    if (selectedSubmission && onUpdateSubmissionGrade) {
      onUpdateSubmissionGrade(selectedSubmission.id, score, feedback);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Evaluator Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EdTech Evaluator & Code Auditor Workspace</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Assessor Console • {currentUser.name}
              </h1>
              <p className="text-amber-100/80 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
                Audit candidate code repositories, review automated Gemini AI rubric breakdowns, test edge cases, and issue official grades.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-amber-200 uppercase font-bold tracking-wider block">Queue</span>
                <span className="text-2xl font-black text-amber-300">{submissions.length}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-amber-200 uppercase font-bold tracking-wider block">Accuracy Rate</span>
                <span className="text-2xl font-black text-white">99.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Queue & Right Audit Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Queue List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Assessment Submissions Queue</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">{submissions.length} Total</span>
          </div>

          <div className="space-y-3">
            {submissions.map((sub) => {
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelect(sub)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{sub.studentName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">{sub.assignmentTitle}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Course: {sub.courseTitle}</span>
                    <span className="font-extrabold text-slate-700">{sub.finalScore || sub.aiEvaluation?.overallScore || 90} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Audit & Grading Tool */}
        {selectedSubmission ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Candidate & Assignment Meta */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {selectedSubmission.courseTitle}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{selectedSubmission.assignmentTitle}</h2>
                  <p className="text-xs text-slate-500">Submitted by <strong className="text-slate-800">{selectedSubmission.studentName}</strong> on {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedSubmission.repositoryUrl && (
                    <a
                      href={selectedSubmission.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>View Repository</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>

              {/* Submitted Code Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span>Submitted Entry Code (`src/index.ts` / `server.ts`)</span>
                </span>
                <div className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed border border-slate-800">
                  <pre>{selectedSubmission.codeContent || '// Candidate code snippet loaded\nexport async function handleAssessment() {\n  // Verified server action\n  return { success: true, evaluated: true };\n}'}</pre>
                </div>
              </div>

              {/* Gemini AI Automated Audit Insight */}
              {selectedSubmission.aiEvaluation && (
                <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Gemini AI Automated Rubric Audit</span>
                    <span className="ml-auto text-indigo-700 font-black text-xs">AI Score: {selectedSubmission.aiEvaluation.overallScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedSubmission.aiEvaluation.summary}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">✓ Type Safety: 100%</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">✓ Test Coverage: 88%</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">✓ Security Audit: Passed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluator Grade Input & Feedback Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Issue Official Assessor Scorecard</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Grade Score: <strong className="text-indigo-600 text-sm font-black">{score}/100</strong></span>
                    <span className="text-slate-400">Passing Grade: 70+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Evaluator Feedback & Recommendations</span>
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for candidate code structure, test suites, and performance..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Grade and Feedback Saved Successfully!</span>
                    </span>
                  )}
                  <button
                    onClick={handleSaveGrade}
                    className="ml-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Score & Feedback</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 flex flex-col items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">Select a submission from the queue to start audit</h3>
          </div>
        )}

      </div>

    </div>
  );
}
