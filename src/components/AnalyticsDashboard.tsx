'use client';
import React, { useState } from 'react';
import { Submission, Course, AIEvaluationResult } from '../types';
import { useAuth } from '../lib/authContext';
import { BarChart3, TrendingUp, Award, CheckCircle2, ShieldCheck, FileCheck2, User, Eye, Search, Filter } from 'lucide-react';
import AIEvaluationReport from './AIEvaluationReport';

interface AnalyticsDashboardProps {
  submissions: Submission[];
  courses: Course[];
  onReviewSubmission: (submission: Submission) => void;
}

export default function AnalyticsDashboard({
  submissions,
  courses,
  onReviewSubmission,
}: AnalyticsDashboardProps) {
  const { currentUser } = useAuth();
  const [selectedSubReport, setSelectedSubReport] = useState<AIEvaluationResult | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const totalSubmissions = submissions.length;
  const evaluatedCount = submissions.filter(s => s.status === 'AI_EVALUATED' || s.status === 'GRADED').length;
  
  const avgScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.finalScore || s.aiEvaluation?.overallScore || 0), 0) / totalSubmissions)
    : 0;

  const passCount = submissions.filter(s => 
    (s.finalScore && s.finalScore >= 70) || s.aiEvaluation?.suggestedGrade === 'PASS'
  ).length;

  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 100;

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.assignmentTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.courseTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Assessment Intelligence
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-400">House of EdTech Evaluator Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Candidate Grade & Skill Analytics</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time tracking of student submission scores, Gemini AI evaluation breakdowns, and candidate skill rubrics.
          </p>
        </div>

        <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 flex items-center space-x-3 self-start md:self-auto">
          <Award className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Average Pass Rate</p>
            <p className="text-xl font-extrabold text-emerald-400">{passRate}%</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>Total Submissions</span>
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalSubmissions}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% stored in server store</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>AI Evaluated Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{evaluatedCount} / {totalSubmissions}</p>
          <span className="text-[11px] text-slate-400 font-medium">Gemini 3.6 Flash Engine</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>Average Score</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{avgScore} / 100</p>
          <span className="text-[11px] text-indigo-600 font-semibold">Across all course rubrics</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>Active Courses</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{courses.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Full CRUD support</span>
        </div>
      </div>

      {/* Candidate Submissions Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Candidate Submission Log</h3>
            <p className="text-xs text-slate-500">
              Detailed list of candidate submissions with score breakdowns and AI report access.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter candidates..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Assignment & Course</th>
                <th className="p-3.5">Submitted Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{sub.studentName}</p>
                        <p className="text-[10px] text-slate-400">{sub.studentEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{sub.assignmentTitle}</p>
                    <p className="text-[10px] text-slate-500">{sub.courseTitle}</p>
                  </td>

                  <td className="p-3.5 text-slate-500">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sub.status === 'AI_EVALUATED' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">
                    {sub.finalScore || sub.aiEvaluation?.overallScore || 'Pending'} / {sub.maxScore}
                  </td>

                  <td className="p-3.5 text-right">
                    {sub.aiEvaluation ? (
                      <button
                        onClick={() => setSelectedSubReport(sub.aiEvaluation!)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View AI Report</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onReviewSubmission(sub)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Evaluation Modal when clicking View AI Report */}
      {selectedSubReport && (
        <AIEvaluationReport
          evaluation={selectedSubReport}
          onClose={() => setSelectedSubReport(null)}
        />
      )}

    </div>
  );
}
