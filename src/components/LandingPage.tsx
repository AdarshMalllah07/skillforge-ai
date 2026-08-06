'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileCheck2,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  Bot,
} from 'lucide-react';
import Footer from '@/src/components/Footer';

const roles = [
  {
    title: 'Students',
    description: 'Browse courses, submit assignments, track progress, and get AI learning support.',
    icon: GraduationCap,
    tone: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    title: 'Instructors',
    description: 'Create courses, generate curriculum with AI, and monitor student performance.',
    icon: BookOpen,
    tone: 'bg-indigo-500/15 text-indigo-300',
  },
  {
    title: 'Evaluators',
    description: 'Review submissions with AI-assisted grading and clear assessment analytics.',
    icon: FileCheck2,
    tone: 'bg-amber-500/15 text-amber-300',
  },
  {
    title: 'Admins',
    description: 'Manage users, courses, and the full learning ecosystem from one place.',
    icon: ShieldCheck,
    tone: 'bg-slate-500/15 text-slate-200',
  },
];

const features = [
  {
    title: 'AI course generation',
    description: 'Build curriculum and assignments faster with Gemini-powered generation.',
    icon: Sparkles,
  },
  {
    title: 'Smart evaluation',
    description: 'Score submissions with AI assistance while keeping human review in control.',
    icon: Bot,
  },
  {
    title: 'Role-based portals',
    description: 'Each role gets a focused dashboard for learning, teaching, or evaluation.',
    icon: Users,
  },
  {
    title: 'Progress analytics',
    description: 'See submission trends, performance signals, and learning outcomes at a glance.',
    icon: BarChart3,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sf-bg text-sf">
      <header className="sticky top-0 z-40 border-b border-sf bg-sf-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.svg" alt="" className="w-9 h-9 rounded-xl shadow-sf-sm shrink-0" />
            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight truncate">SkillForge AI</p>
              <p className="text-[10px] text-sf-muted font-medium hidden sm:block">
                AI Assessment Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center h-9 px-3 rounded-xl text-xs font-bold text-sf-muted hover:text-sf hover:bg-sf-surface-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sf-sm transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 via-sf-bg to-sf-bg dark:from-indigo-950/40"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="max-w-3xl"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300 mb-4">
                SkillForge AI
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.08] text-sf">
                Learn, assess, and grow with AI-powered education.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-sf-muted leading-relaxed max-w-2xl">
                An intelligent LMS for modern institutions — AI course generation, role-based
                portals, assisted grading, and clear analytics in one platform.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sf-md transition-colors"
                >
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center h-11 px-5 rounded-2xl text-sm font-bold bg-sf-surface text-sf border border-sf hover:bg-sf-surface-2 shadow-sf-xs transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
              className="mt-14 sm:mt-16 rounded-3xl border border-sf bg-sf-surface shadow-sf-lg overflow-hidden"
            >
              <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sf">
                {[
                  { label: 'AI curriculum', value: 'Generate courses & assignments' },
                  { label: 'Four portals', value: 'Student · Instructor · Evaluator · Admin' },
                  { label: 'Gemini powered', value: 'Assisted grading & learning support' },
                ].map((item) => (
                  <div key={item.label} className="px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-sf">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">What you can do</h2>
            <p className="mt-3 text-sm sm:text-base text-sf-muted leading-relaxed">
              SkillForge AI connects teaching, learning, and evaluation with AI assistance at every
              step — without replacing human judgment.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border border-sf bg-sf-surface p-5 sm:p-6 shadow-sf-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-sf-accent-soft text-sf-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm text-sf-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-y border-sf bg-sf-surface-2/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Built for every role</h2>
              <p className="mt-3 text-sm sm:text-base text-sf-muted leading-relaxed">
                Sign in once and land in the portal that matches how you teach, learn, evaluate, or
                administer.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((role, i) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl bg-slate-900 text-white p-5 shadow-sf-md"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${role.tone}`}
                  >
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold">{role.title}</h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{role.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-sf bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-sf-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-xl">
              Ready to explore SkillForge AI?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-indigo-100/80 max-w-xl leading-relaxed">
              Create an account to access your role-based dashboard, or sign in if you already have
              one.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold bg-white text-slate-900 hover:bg-indigo-50 transition-colors"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center h-11 px-5 rounded-2xl text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
