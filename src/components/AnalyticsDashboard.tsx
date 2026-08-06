'use client';
import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Submission, Course, AIEvaluationResult } from '../types';
import { Award, BarChart3, FileCheck2, ShieldCheck, TrendingUp, Eye, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AIEvaluationReport from './AIEvaluationReport';
import { PageHero } from './ui/PageHero';
import { StatCard, Card } from './ui/Card';
import { Badge, statusBadgeTone } from './ui/Badge';
import { THead, Th, Td, Tr } from './ui/Table';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { useAuth } from '../lib/authContext';
import { submissionsPathForRole } from '../lib/permissions';

interface AnalyticsDashboardProps {
  submissions: Submission[];
  courses: Course[];
}

export default function AnalyticsDashboard({
  submissions,
  courses,
}: AnalyticsDashboardProps) {
  const { currentUser } = useAuth();
  const [selectedSubReport, setSelectedSubReport] = useState<AIEvaluationResult | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const totalSubmissions = submissions.length;
  const evaluatedCount = submissions.filter(
    (s) => s.status === 'AI_EVALUATED' || s.status === 'GRADED'
  ).length;

  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          submissions.reduce(
            (acc, s) => acc + (s.finalScore || s.aiEvaluation?.overallScore || 0),
            0
          ) / totalSubmissions
        )
      : 0;

  const passCount = submissions.filter(
    (s) => (s.finalScore && s.finalScore >= 70) || s.aiEvaluation?.suggestedGrade === 'PASS'
  ).length;
  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const scoreBuckets = useMemo(() => {
    const buckets = [
      { name: '0-39', count: 0 },
      { name: '40-59', count: 0 },
      { name: '60-79', count: 0 },
      { name: '80-100', count: 0 },
    ];
    submissions.forEach((s) => {
      const score = s.finalScore || s.aiEvaluation?.overallScore;
      if (score == null) return;
      if (score < 40) buckets[0].count += 1;
      else if (score < 60) buckets[1].count += 1;
      else if (score < 80) buckets[2].count += 1;
      else buckets[3].count += 1;
    });
    return buckets;
  }, [submissions]);

  const submissionsOverTime = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) => {
      const key = new Date(s.submittedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .slice(-8)
      .map(([name, count]) => ({ name, count }));
  }, [submissions]);

  return (
    <div className="space-y-6">
      <PageHero
        tone="slate"
        eyebrow={
          <>
            <BarChart3 className="w-3.5 h-3.5" />
            Assessment Intelligence
          </>
        }
        title="Performance analytics"
        description="Charts and KPIs for scores, pass rates, and submission trends. Use Submissions for the full grading queue."
        actions={
          <Link
            href={submissionsPathForRole(currentUser?.role)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/15 min-h-11"
          >
            Open submissions queue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
        aside={
          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/15 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300">Pass rate</p>
              <p className="text-xl font-extrabold text-emerald-300">{passRate}%</p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Submissions"
          value={totalSubmissions}
          hint="All candidates"
          accent="indigo"
          icon={<FileCheck2 className="w-5 h-5" />}
        />
        <StatCard
          label="AI Evaluated"
          value={`${evaluatedCount}/${totalSubmissions || 0}`}
          hint="Gemini engine"
          accent="emerald"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Average Score"
          value={avgScore}
          hint="Across rubrics"
          accent="amber"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          label="Courses"
          value={courses.length}
          hint="Active catalog"
          accent="slate"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-extrabold text-sf mb-4">Score distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sf-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-sf-muted)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-sf-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-sf-surface)',
                    border: '1px solid var(--color-sf-border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-extrabold text-sf mb-4">Submissions over time</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionsOverTime.length ? submissionsOverTime : [{ name: '—', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sf-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-sf-muted)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-sf-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-sf-surface)',
                    border: '1px solid var(--color-sf-border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-sf flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-sf">Recent submissions snapshot</h3>
            <p className="text-xs text-sf-muted">Latest 8 results — full queue lives under Submissions</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sf-muted" />
            <input
              type="text"
              placeholder="Filter snapshot…"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs border border-sf rounded-xl bg-sf-surface text-sf focus:ring-2 focus:ring-indigo-500/30 outline-none"
            />
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No submissions found" description="Try a different filter or wait for candidate work." />
          </div>
        ) : (
          <div className="max-h-[22rem] overflow-auto">
            <table className="min-w-full text-sm">
              <THead>
                <tr>
                  <Th>Candidate</Th>
                  <Th>Assignment</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th className="text-right">Report</Th>
                </tr>
              </THead>
              <tbody>
                {filteredSubmissions.slice(0, 8).map((sub) => (
                  <Tr key={sub.id}>
                    <Td>
                      <p className="font-bold text-sf text-xs">{sub.studentName}</p>
                      <p className="text-[10px] text-sf-muted">{sub.courseTitle}</p>
                    </Td>
                    <Td className="text-xs text-sf">{sub.assignmentTitle}</Td>
                    <Td>
                      <Badge tone={statusBadgeTone(sub.status)}>{sub.status.replace(/_/g, ' ')}</Badge>
                    </Td>
                    <Td className="font-bold text-sf text-xs">
                      {sub.finalScore || sub.aiEvaluation?.overallScore || '—'} / {sub.maxScore}
                    </Td>
                    <Td className="text-right">
                      {sub.aiEvaluation ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedSubReport(sub.aiEvaluation!)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          AI Report
                        </Button>
                      ) : (
                        <span className="text-[10px] text-sf-muted">—</span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedSubReport && (
        <AIEvaluationReport evaluation={selectedSubReport} onClose={() => setSelectedSubReport(null)} />
      )}
    </div>
  );
}
