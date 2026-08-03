import React from 'react';
import { useAuth } from '../lib/authContext';
import { Course, Submission } from '../types';
import { 
  GraduationCap, BookOpen, Plus, Sparkles, FileCheck2, Users, 
  BarChart3, CheckCircle2, AlertCircle, Edit, ExternalLink, ArrowRight 
} from 'lucide-react';

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

  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);
  const pendingGradingCount = submissions.filter(s => s.status === 'PENDING' || s.status === 'AI_EVALUATED').length;

  return (
    <div className="space-y-6">
      
      {/* Instructor Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty & Instructor Suite</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Instructor Console • {currentUser.name}
              </h1>
              <p className="text-indigo-200/80 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
                Design curriculum modules, author auto-grading rubrics, launch Gemini AI curriculum generators, and evaluate candidate code submissions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAIGenerator}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Curriculum Architect</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Courses</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{courses.length}</p>
          <span className="text-[10px] text-indigo-600 font-medium">{publishedCount} Published</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Enrolled Candidates</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Active Cohorts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reviews</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{pendingGradingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Faculty Approval</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Graded Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{submissions.filter(s => s.status === 'GRADED').length}</p>
          <span className="text-[10px] text-purple-600 font-medium">AI & Rubric Audited</span>
        </div>
      </div>

      {/* Main Course Management & Submissions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Authored Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Authored Curriculum Catalog</span>
              </h2>
              <button
                onClick={onOpenAIGenerator}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Course</span>
              </button>
            </div>

            <div className="space-y-3">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {course.level}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{course.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onSelectCourse(course)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Manage Modules</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Submissions Queue */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Submission Grading Queue</span>
              </h3>
              <button
                onClick={onOpenSubmissions}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{sub.studentName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{sub.assignmentTitle}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Course: {sub.courseTitle}</span>
                    <button
                      onClick={onOpenSubmissions}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Review Code →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
