import React, { useState } from 'react';
import { Course, Assignment, Lesson } from '../types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { 
  ArrowLeft, BookOpen, Layers, CheckCircle2, Clock, Code, FileText, 
  Sparkles, Send, ShieldAlert, Award, Plus, Trash2, Edit 
} from 'lucide-react';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onOpenSubmissionPortal: (assignment: Assignment, course: Course) => void;
  onCreateAssignment: (courseId: string, assignmentData: Partial<Assignment>) => void;
}

export default function CourseDetailView({
  course,
  onBack,
  onOpenSubmissionPortal,
  onCreateAssignment,
}: CourseDetailViewProps) {
  const { currentUser } = useAuth();
  const isInstructor =
    currentUser?.role === 'INSTRUCTOR' ||
    currentUser?.role === 'EVALUATOR' ||
    currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'modules' | 'assignments' | 'ai_tutor'>('modules');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(course.modules[0]?.lessons[0] || null);
  const [isEnrolled, setIsEnrolled] = useState(currentUser?.role !== 'STUDENT');

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Teaching Assistant for "${course.title}". Ask me any architectural questions, Next.js 16 concepts, or help with code challenges!`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleEnroll = async () => {
    try {
      await api(`/api/courses/${course.id}/enroll`, { method: 'POST' });
      setIsEnrolled(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAiThinking) return;

    const userMsg = inputPrompt;
    setInputPrompt('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAiThinking(true);

    try {
      const data = await api<{ reply: string }>('/api/ai/tutor-chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: userMsg,
          courseContext: course.title,
          lessonTitle: selectedLesson?.title || 'General',
        }),
      });

      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: data.reply || 'I could not generate a response right now.' },
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: err.message || 'Tutor chat unavailable. Check Gemini API key.' },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Course Catalog
      </button>

      {/* Course Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {course.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <span>Instructor: <strong className="text-white">{course.instructorName}</strong></span>
              <span>&bull;</span>
              <span>{course.modules.length} Modules</span>
              <span>&bull;</span>
              <span>{course.assignments.length} Assignments</span>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 space-y-3 w-full md:w-64 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="font-bold text-emerald-400 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Enrolled
              </span>
            </div>
            
            <button
              onClick={() => setActiveTab('assignments')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all text-center flex items-center justify-center space-x-2"
            >
              <Code className="w-4 h-4" />
              <span>View Assignments ({course.assignments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'modules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Modules ({course.modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Coding Challenges & Submissions ({course.assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_tutor')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'ai_tutor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>AI Tutor Assistant</span>
        </button>
      </div>

      {/* TAB 1: MODULES & LESSONS */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Module List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Course Structure
            </h3>

            <div className="space-y-3">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mod.description}</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {mod.lessons.map(les => (
                      <button
                        key={les.id}
                        onClick={() => setSelectedLesson(les)}
                        className={`w-full text-left p-3 text-xs flex items-center justify-between transition-colors ${
                          selectedLesson?.id === les.id
                            ? 'bg-indigo-50/80 text-indigo-700 font-bold border-l-4 border-indigo-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono ml-2">
                          {les.durationMinutes}m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Lesson Reader Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Lesson Content
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedLesson.title}</h2>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {selectedLesson.durationMinutes} mins
                  </span>
                </div>

                <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 text-slate-700">
                  <p className="whitespace-pre-line leading-relaxed">{selectedLesson.content}</p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Lesson Verified
                  </span>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Proceed to Coding Assignment &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500 text-xs">
                Select a lesson from the left module list to begin reading.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ASSIGNMENTS & SUBMISSIONS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Course Assignments & Rubrics</h3>
              <p className="text-xs text-slate-500">
                Submit your solution to receive instant AI evaluation and rubric scoring.
              </p>
            </div>

            {isInstructor && (
              <button
                onClick={() => {
                  onCreateAssignment(course.id, {
                    title: 'New Next.js 16 Coding Challenge',
                    description: 'Implement a type-safe API route or Server Action with Zod validation.',
                    type: 'CODE',
                    maxScore: 100,
                    rubrics: [
                      { id: `rub_${Date.now()}_1`, title: 'Functionality & Architecture', description: 'Correct execution', maxPoints: 50 },
                      { id: `rub_${Date.now()}_2`, title: 'Security & Sanitization', description: 'Input checks', maxPoints: 50 }
                    ]
                  });
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Assignment (CRUD)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.assignments.map(assign => (
              <div key={assign.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    assign.type === 'CODE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {assign.type} CHALLENGE
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Max Score: {assign.maxScore} pts
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{assign.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {assign.description}
                  </p>
                </div>

                {/* Rubrics preview */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Evaluation Rubric Parameters ({assign.rubrics.length})
                  </span>
                  <div className="space-y-1">
                    {assign.rubrics.map(rub => (
                      <div key={rub.id} className="flex justify-between text-[11px] text-slate-700">
                        <span>&bull; {rub.title}</span>
                        <span className="font-mono text-indigo-600 font-semibold">{rub.maxPoints} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Due: {new Date(assign.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onOpenSubmissionPortal(assign, course)}
                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <span>Open Submission Workspace</span>
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI TUTOR */}
      {activeTab === 'ai_tutor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive AI Tutor Assistant</h3>
              <p className="text-xs text-slate-500">Powered by Gemini 3.6 Flash &bull; Contextualized for {course.title}</p>
            </div>
          </div>

          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-500 text-xs animate-pulse">
                  Gemini AI Tutor is formulating a response...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendTutorMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about Server Actions, Next.js 16, or code bugs..."
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              className="flex-1 text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isAiThinking}
              className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
