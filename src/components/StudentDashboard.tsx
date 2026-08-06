'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { Course, Submission, Assignment } from '../types';
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  FileCode2,
  Award,
  Sparkles,
  ArrowRight,
  BarChart3,
  FileCheck2,
} from 'lucide-react';
import { PageHero } from './ui/PageHero';
import { StatCard } from './ui/Card';
import { Badge, statusBadgeTone } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { ActivityTimeline } from './ui/ActivityTimeline';
import { Button } from './ui/Button';

interface StudentDashboardProps {
  courses: Course[];
  submissions: Submission[];
  onSelectCourse: (course: Course) => void;
  onSubmitAssignment: (assignment: Assignment, course: Course) => void;
}

export default function StudentDashboard({
  courses,
  submissions,
  onSelectCourse,
  onSubmitAssignment,
}: StudentDashboardProps) {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const studentSubmissions = submissions.filter(
    (s) => s.studentId === currentUser.id || s.studentName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const gradedSubmissions = studentSubmissions.filter(
    (s) => s.status === 'GRADED' || s.status === 'AI_EVALUATED'
  );
  const avgScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce(
            (acc, s) => acc + (s.finalScore || s.aiEvaluation?.overallScore || 0),
            0
          ) / gradedSubmissions.length
        )
      : 0;

  const allAssignments = courses.flatMap((c) =>
    (c.assignments || []).map((a) => ({ assignment: a, course: c }))
  );
  const pendingCount = allAssignments.filter(
    ({ assignment }) => !studentSubmissions.some((s) => s.assignmentId === assignment.id)
  ).length;

  const timeline = [...studentSubmissions]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 5)
    .map((sub) => ({
      id: sub.id,
      title: sub.assignmentTitle,
      description:
        sub.instructorFeedback ||
        sub.aiEvaluation?.summary ||
        `${sub.status.replace(/_/g, ' ')} · ${sub.courseTitle}`,
      time: new Date(sub.submittedAt).toLocaleDateString(),
      tone:
        sub.status === 'GRADED'
          ? ('emerald' as const)
          : sub.status === 'AI_EVALUATED'
            ? ('indigo' as const)
            : ('amber' as const),
    }));

  return (
    <div className="space-y-6">
      <PageHero
        tone="emerald"
        eyebrow={
          <>
            <GraduationCap className="w-3.5 h-3.5" />
            Candidate Portal · SkillForge AI
          </>
        }
        title={`Welcome back, ${currentUser.name}`}
        description="Enroll in courses, submit assignments, use the AI tutor, and track your progress."
        icon={<GraduationCap className="w-80 h-80 text-emerald-300" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/courses">
              <Button className="bg-emerald-500 hover:bg-emerald-400">
                <BookOpen className="w-4 h-4" />
                Browse courses
              </Button>
            </Link>
            <Link href="/student/submissions">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <FileCheck2 className="w-4 h-4" />
                My submissions
              </Button>
            </Link>
            <Link href="/student/analytics">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <BarChart3 className="w-4 h-4" />
                My progress
              </Button>
            </Link>
          </div>
        }
        aside={
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">
                Average Grade
              </span>
              <span className="text-2xl font-black text-emerald-300">{avgScore || '—'}%</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">
                Submissions
              </span>
              <span className="text-2xl font-black text-white">{studentSubmissions.length}</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Courses"
          value={courses.length}
          hint="Active learning paths"
          accent="emerald"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          hint="Assignments to submit"
          accent="amber"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Graded"
          value={gradedSubmissions.length}
          hint="Rubrics verified"
          accent="indigo"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Score"
          value={avgScore ? `${avgScore}%` : '—'}
          hint="Across evaluations"
          accent="violet"
          icon={<Award className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-sf">Assessments & Challenges</h2>
              </div>
              <span className="text-xs font-bold text-sf-muted">{allAssignments.length} available</span>
            </div>

            {allAssignments.length === 0 ? (
              <EmptyState
                title="No assignments yet"
                description="Enroll in a course to see coding challenges and assessments here."
                icon={<FileCode2 className="w-7 h-7" />}
              />
            ) : (
              <div className="space-y-3">
                {allAssignments.map(({ assignment, course }) => {
                  const sub = studentSubmissions.find((s) => s.assignmentId === assignment.id);
                  return (
                    <div
                      key={assignment.id}
                      className="group p-4 rounded-xl border border-sf hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{course.title}</Badge>
                          <span className="text-xs font-extrabold text-sf">{assignment.title}</span>
                        </div>
                        <p className="text-xs text-sf-muted line-clamp-1">{assignment.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-sf-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span>·</span>
                          <span className="font-bold text-sf">{assignment.maxScore} pts</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {sub ? (
                          <Badge tone={statusBadgeTone(sub.status)}>
                            {sub.status.replace(/_/g, ' ')} ·{' '}
                            {sub.finalScore || sub.aiEvaluation?.overallScore || '—'}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="accent"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => onSubmitAssignment(assignment, course)}
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
            <h2 className="text-base font-extrabold text-sf flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Enrolled modules
            </h2>
            {courses.length === 0 ? (
              <EmptyState
                title="No courses enrolled"
                description="Browse the catalog and enroll to start learning."
                icon={<BookOpen className="w-7 h-7" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onSelectCourse(course)}
                    className="text-left p-4 rounded-2xl border border-sf hover:border-indigo-300 hover:shadow-sf-md transition-all space-y-3 bg-sf-surface-2/40"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-28 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {course.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-sf mt-0.5 line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-sf-muted line-clamp-2 mt-1">{course.description}</p>
                    </div>
                    <div className="pt-2 border-t border-sf flex items-center justify-between text-xs font-bold text-sf-muted">
                      <span>{course.modules.length} Modules</span>
                      <span className="text-indigo-600 flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-sf-surface rounded-2xl p-5 sm:p-6 border border-sf shadow-sf-sm space-y-4">
            <h3 className="text-sm font-extrabold text-sf flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recent activity
            </h3>
            {timeline.length === 0 ? (
              <p className="text-xs text-sf-muted">Submit an assignment to see your activity timeline.</p>
            ) : (
              <ActivityTimeline items={timeline} />
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-4 shadow-sf-md">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full ring-2 ring-emerald-400/50 object-cover"
              />
              <div>
                <h4 className="text-sm font-extrabold">{currentUser.name}</h4>
                <p className="text-xs text-indigo-300">Candidate</p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  currentUser.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">No skills added yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
