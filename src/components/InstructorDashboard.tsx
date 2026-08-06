'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { Course, Submission } from '../types';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Sparkles,
  FileCheck2,
  Users,
  AlertCircle,
  CheckCircle2,
  Edit,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { PageHero } from './ui/PageHero';
import { StatCard } from './ui/Card';
import { Badge, statusBadgeTone } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { ActivityTimeline } from './ui/ActivityTimeline';
import { Button } from './ui/Button';

interface InstructorDashboardProps {
  courses: Course[];
  submissions: Submission[];
  onSelectCourse: (course: Course) => void;
  onOpenAIGenerator: () => void;
  onOpenSubmissions: () => void;
}

export default function InstructorDashboard({
  courses,
  submissions,
  onSelectCourse,
  onOpenAIGenerator,
  onOpenSubmissions,
}: InstructorDashboardProps) {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const myCourses = courses.filter((c) => c.instructorId === currentUser.id);
  const publishedCount = myCourses.filter((c) => c.status === 'PUBLISHED').length;
  const totalStudents = myCourses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);
  const pendingGradingCount = submissions.filter(
    (s) => s.status === 'PENDING' || s.status === 'AI_EVALUATED'
  ).length;

  const timeline = [...submissions]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 5)
    .map((sub) => ({
      id: sub.id,
      title: `${sub.studentName} · ${sub.assignmentTitle}`,
      description: sub.courseTitle,
      time: new Date(sub.submittedAt).toLocaleDateString(),
      tone:
        sub.status === 'GRADED'
          ? ('emerald' as const)
          : sub.status === 'PENDING'
            ? ('amber' as const)
            : ('indigo' as const),
    }));

  return (
    <div className="space-y-6">
      <PageHero
        tone="indigo"
        eyebrow={
          <>
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty & Instructor Suite
          </>
        }
        title={`Instructor Console · ${currentUser.name}`}
        description="Author your courses, create assignments, grade your cohort, and generate curriculum with AI."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onOpenAIGenerator} className="bg-indigo-500 hover:bg-indigo-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Curriculum Architect
            </Button>
            <Link href="/instructor/submissions">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <FileCheck2 className="w-4 h-4" />
                Grading queue
              </Button>
            </Link>
            <Link href="/instructor/analytics">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Courses"
          value={myCourses.length}
          hint={`${publishedCount} published`}
          accent="indigo"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="Candidates"
          value={totalStudents}
          hint="Active cohorts"
          accent="emerald"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Reviews"
          value={pendingGradingCount}
          hint="Awaiting approval"
          accent="amber"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Graded"
          value={submissions.filter((s) => s.status === 'GRADED').length}
          hint="AI & rubric audited"
          accent="violet"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-sf flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Authored catalog
              </h2>
              <Link
                href="/courses"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 min-h-9"
              >
                <Plus className="w-3.5 h-3.5" />
                Manage courses
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <EmptyState
                title="No courses yet"
                description="Generate a curriculum with AI Architect to publish your first course."
                actionLabel="Open AI Architect"
                onAction={onOpenAIGenerator}
                icon={<Sparkles className="w-7 h-7" />}
              />
            ) : (
              <div className="space-y-3">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group p-4 rounded-xl border border-sf hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sf-surface-2/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="info">{course.level}</Badge>
                          <Badge tone={statusBadgeTone(course.status)}>{course.status}</Badge>
                          <span className="text-xs font-bold text-sf truncate">{course.title}</span>
                        </div>
                        <p className="text-xs text-sf-muted line-clamp-1 mt-0.5">{course.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="row-actions-hover sm:opacity-100"
                      onClick={() => onSelectCourse(course)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-sf flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                Grading queue
              </h3>
              <button
                type="button"
                onClick={onOpenSubmissions}
                className="text-xs font-bold text-amber-600 flex items-center gap-1 min-h-9"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {submissions.length === 0 ? (
              <p className="text-xs text-sf-muted">No submissions in the queue.</p>
            ) : (
              <ActivityTimeline items={timeline} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
