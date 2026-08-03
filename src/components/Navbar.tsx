import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, FileCheck2, Sparkles, BarChart3, User, LogOut, GraduationCap, Menu, X, Users,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { UserRole } from '../types';

export type AppTab = 
  | 'courses' 
  | 'submissions' 
  | 'generator' 
  | 'analytics' 
  | 'admin_users' 
  | 'student_dashboard' 
  | 'instructor_dashboard' 
  | 'evaluator_dashboard' 
  | 'login' 
  | 'signup' 
  | 'forgot_password';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const {
    currentUser,
    isAuthenticated,
    openProfileModal,
    logout,
  } = useAuth();

  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  const role = currentUser?.role;

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    INSTRUCTOR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    EVALUATOR: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const handleTabClick = (tab: AppTab) => {
    setActiveTab(tab);
    setIsSideDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
            onClick={() => handleTabClick('courses')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-950/10 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">EdTech Matrix</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded whitespace-nowrap hidden sm:inline-block">
                  NEXT.JS 16
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block whitespace-nowrap">
                House of EdTech Assessment Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Items - Clean & De-congested */}
          <nav className="hidden lg:flex items-center space-x-1.5 py-1">
            
            {/* Active Persona Console Shortcut */}
            {role === 'STUDENT' && (
              <button
                onClick={() => handleTabClick('student_dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'student_dashboard'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </button>
            )}

            {role === 'INSTRUCTOR' && (
              <button
                onClick={() => handleTabClick('instructor_dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'instructor_dashboard'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Faculty Console</span>
              </button>
            )}

            {role === 'EVALUATOR' && (
              <button
                onClick={() => handleTabClick('evaluator_dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'evaluator_dashboard'
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Assessor Console</span>
              </button>
            )}

            {role === 'ADMIN' && (
              <button
                onClick={() => handleTabClick('admin_users')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'admin_users'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users & Roles</span>
              </button>
            )}

            {/* Courses Catalog */}
            {isAuthenticated && (
            <button
              onClick={() => handleTabClick('courses')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            )}

            {/* Submissions & Grading */}
            {isAuthenticated && (
            <button
              onClick={() => handleTabClick('submissions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>
            )}

            {/* AI Curriculum Generator */}
            {(role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'EVALUATOR') && (
              <button
                onClick={() => handleTabClick('generator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'generator'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Architect</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Profile & Menu Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {isAuthenticated && currentUser ? (
              <button
                onClick={() => openProfileModal()}
                className="p-1 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                title="Profile Settings"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
              </button>
            ) : (
              <button
                onClick={() => handleTabClick('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Side Drawer Toggle */}
            <button
              onClick={() => setIsSideDrawerOpen(true)}
              className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all flex items-center space-x-1.5 font-bold text-xs shadow-xs"
              title="Open Full Navigation Menu"
            >
              <Menu className="w-4 h-4 text-indigo-300" />
              <span>Menu</span>
            </button>

          </div>

        </div>
      </div>
    </header>

    {/* Full-Height Slide-Over Side Drawer Overlay rendered via Portal directly to body */}
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {isSideDrawerOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSideDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Drawer Container Panel - Full Height */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-md h-screen bg-white shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white leading-none">EdTech Matrix</h2>
                    <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">Platform Navigation & Roles</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSideDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Active User Card & Quick Role Selector */}
                {isAuthenticated && currentUser ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${roleColors[currentUser.role]}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
                    Sign in to access your role-based dashboard.
                  </div>
                )}

                {isAuthenticated && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Main Platform Modules
                  </p>
                  <button
                    onClick={() => handleTabClick('courses')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      activeTab === 'courses' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold">Course Catalog</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabClick('submissions')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      activeTab === 'submissions' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileCheck2 className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold">Submissions & Grading</span>
                    </div>
                  </button>
                  {(role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'EVALUATOR') && (
                  <button
                    onClick={() => handleTabClick('generator')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      activeTab === 'generator' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">AI Curriculum Architect</span>
                    </div>
                  </button>
                  )}
                  <button
                    onClick={() => handleTabClick('analytics')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      activeTab === 'analytics' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold">Analytics & Rubrics</span>
                    </div>
                  </button>
                </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
                {isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsSideDrawerOpen(false);
                        openProfileModal();
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSideDrawerOpen(false);
                        logout();
                        handleTabClick('login');
                      }}
                      className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTabClick('login')}
                      className="p-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleTabClick('signup')}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
  );
}
