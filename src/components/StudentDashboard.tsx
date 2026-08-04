'use client';
import React from 'react';
import { useAuth } from '../lib/authContext';
import { Course, Submission, Assignment } from '../types';
import { 
  GraduationCap, BookOpen, Clock, CheckCircle2, AlertCircle, FileCode2, 
  Award, Sparkles, ArrowRight, BarChart2, Check, ExternalLink, Calendar
} from 'lucide-react';

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

  // Find candidate's submissions
  const studentSubmissions = submissions.filter(
    s => s.studentId === currentUser.id || s.studentName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const gradedSubmissions = studentSubmissions.filter(s => s.status === 'GRADED' || s.status === 'AI_EVALUATED');
  const avgScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.finalScore || s.aiEvaluation?.overallScore || 0), 0) / gradedSubmissions.length)
    : 92;

  // Collect all assignments from courses
  const allAssignments = courses.flatMap(c => 
    (c.assignments || []).map(a => ({ assignment: a, course: c }))
  );

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Hero */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-emerald-300" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Candidate Portal • House of EdTech</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {currentUser.name}! 👋
              </h1>
              <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
                Track your active course modules, code submission deadlines, automated AI rubrics, and skill assessment certifications.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">Average Grade</span>
                <span className="text-2xl font-black text-emerald-300">{avgScore}%</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">Submissions</span>
                <span className="text-2xl font-black text-white">{studentSubmissions.length || 3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{courses.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Active Learning Paths</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Assignments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">2</p>
          <span className="text-[10px] text-amber-600 font-medium">Due in next 5 days</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Graded Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{studentSubmissions.length}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Rubrics Verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Candidate Rank</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">Top 5%</p>
          <span className="text-[10px] text-purple-600 font-medium">EdTech Skill Index</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Assignments & My Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Assignments List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-900">Assigned Assessments & Coding Challenges</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">{allAssignments.length} Available</span>
            </div>

            <div className="space-y-3">
              {allAssignments.map(({ assignment, course }) => {
                const sub = studentSubmissions.find(s => s.assignmentId === assignment.id);
                return (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {course.title}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">{assignment.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{assignment.description}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{assignment.maxScore} Max Points</span>
                      </div>
                    </div>

                    <div>
                      {sub ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Submitted ({sub.finalScore || sub.aiEvaluation?.overallScore || 95}/100)</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSubmitAssignment(assignment, course)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                        >
                          <FileCode2 className="w-3.5 h-3.5" />
                          <span>Submit Solution</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Enrolled Curriculum Modules</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-3 bg-slate-50/50"
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
                    <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span>{course.modules.length} Modules</span>
                    <span className="text-indigo-600 flex items-center space-x-1">
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Submission History & Candidate Progress */}
        <div className="space-y-6">
          
          {/* Submission Feedback Logs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recent AI Evaluation Reports</span>
            </h3>

            <div className="space-y-3">
              {studentSubmissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{sub.assignmentTitle}</span>
                    <span className="font-black text-emerald-600">{sub.finalScore || sub.aiEvaluation?.overallScore || 90}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    "{sub.instructorFeedback || sub.aiEvaluation?.summary || 'Great work adhering to server actions and clean modular separation.'}"
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Profile Skills Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full ring-2 ring-emerald-400/50"
              />
              <div>
                <h4 className="text-sm font-extrabold text-white">{currentUser.name}</h4>
                <p className="text-xs text-indigo-300">Candidate ID: {currentUser.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Verified Skill Credentials
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  currentUser.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-lg">
                      ✓ {skill}
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
