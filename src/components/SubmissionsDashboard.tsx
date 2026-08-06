'use client';

import React, { useMemo, useState } from 'react';
import { Course, Submission, AIEvaluationResult } from '../types';
import { useAuth } from '../lib/authContext';
import {
  FileCheck2,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import AIEvaluationReport from './AIEvaluationReport';
import { PageHero } from './ui/PageHero';
import { StatCard, Card } from './ui/Card';
import { Badge, statusBadgeTone } from './ui/Badge';
import { THead, Th, Td, Tr } from './ui/Table';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import Select from './ui/Select';

interface SubmissionsDashboardProps {
  submissions: Submission[];
  courses: Course[];
  onReviewSubmission: (submission: Submission) => void;
}

export default function SubmissionsDashboard({
  submissions,
  courses,
  onReviewSubmission,
}: SubmissionsDashboardProps) {
  const { currentUser } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubReport, setSelectedSubReport] = useState<AIEvaluationResult | null>(null);

  const isStudent = currentUser?.role === 'STUDENT';

  const scopedSubmissions = useMemo(() => {
    if (!isStudent || !currentUser) return submissions;
    return submissions.filter(
      (s) =>
        s.studentId === currentUser.id ||
        s.studentName.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [submissions, isStudent, currentUser]);

  const pendingCount = scopedSubmissions.filter(
    (s) => s.status === 'PENDING' || s.status === 'AI_EVALUATED'
  ).length;
  const gradedCount = scopedSubmissions.filter((s) => s.status === 'GRADED').length;
  const aiCount = scopedSubmissions.filter((s) => Boolean(s.aiEvaluation)).length;

  const filtered = scopedSubmissions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHero
        tone="slate"
        eyebrow={
          <>
            <FileCheck2 className="w-3.5 h-3.5" />
            {isStudent ? 'My Submissions' : 'Grading Queue'}
          </>
        }
        title={isStudent ? 'Your assignment submissions' : 'Submissions & grading'}
        description={
          isStudent
            ? 'Track status, scores, and AI evaluation reports for work you have submitted.'
            : 'Review candidate work, open AI rubric reports, and move items through the grading queue.'
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={scopedSubmissions.length}
          hint={isStudent ? 'Your submissions' : 'In queue'}
          accent="indigo"
          icon={<FileCheck2 className="w-5 h-5" />}
        />
        <StatCard
          label="Needs review"
          value={pendingCount}
          hint="Pending or AI evaluated"
          accent="amber"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Graded"
          value={gradedCount}
          hint="Final scores issued"
          accent="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="AI reports"
          value={aiCount}
          hint="Gemini evaluations"
          accent="violet"
          icon={<Sparkles className="w-5 h-5" />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-sf flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-sf">
              {isStudent ? 'Submission history' : 'Review queue'}
            </h3>
            <p className="text-xs text-sf-muted">
              {filtered.length} of {scopedSubmissions.length} shown · {courses.length} courses in catalog
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sf-muted" />
              <input
                type="text"
                placeholder={isStudent ? 'Filter assignments…' : 'Filter candidates…'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs border border-sf rounded-xl bg-sf-surface text-sf focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
            </div>
            <div className="sm:w-44">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Status filter"
                options={[
                  { value: 'ALL', label: 'All statuses' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'AI_EVALUATED', label: 'AI evaluated' },
                  { value: 'GRADED', label: 'Graded' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No submissions here"
              description={
                isStudent
                  ? 'Submit an assignment from a course to see it in this list.'
                  : 'Nothing matches this filter. Try another status or clear search.'
              }
              icon={<AlertCircle className="w-7 h-7" />}
            />
          </div>
        ) : (
          <div className="max-h-[32rem] overflow-auto">
            <table className="min-w-full text-sm">
              <THead>
                <tr>
                  {!isStudent ? <Th>Candidate</Th> : null}
                  <Th>Assignment</Th>
                  <Th>Submitted</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </THead>
              <tbody>
                {filtered.map((sub) => (
                  <Tr key={sub.id}>
                    {!isStudent ? (
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sf text-xs">{sub.studentName}</p>
                            <p className="text-[10px] text-sf-muted">{sub.studentEmail}</p>
                          </div>
                        </div>
                      </Td>
                    ) : null}
                    <Td>
                      <p className="font-bold text-sf text-xs">{sub.assignmentTitle}</p>
                      <p className="text-[10px] text-sf-muted">{sub.courseTitle}</p>
                    </Td>
                    <Td className="text-sf-muted text-xs">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </Td>
                    <Td>
                      <Badge tone={statusBadgeTone(sub.status)}>
                        {sub.status.replace(/_/g, ' ')}
                      </Badge>
                    </Td>
                    <Td className="font-bold text-sf text-xs">
                      {sub.finalScore ?? sub.aiEvaluation?.overallScore ?? '—'} / {sub.maxScore}
                    </Td>
                    <Td className="text-right">
                      <div className="row-actions-hover inline-flex justify-end gap-1.5">
                        {sub.aiEvaluation ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedSubReport(sub.aiEvaluation!)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            AI Report
                          </Button>
                        ) : null}
                        {!isStudent ? (
                          <Button size="sm" onClick={() => onReviewSubmission(sub)}>
                            Review
                          </Button>
                        ) : null}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedSubReport ? (
        <AIEvaluationReport
          evaluation={selectedSubReport}
          onClose={() => setSelectedSubReport(null)}
        />
      ) : null}
    </div>
  );
}
