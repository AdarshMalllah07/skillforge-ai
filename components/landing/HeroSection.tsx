"use client";

import Link from "next/link";
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-violet-100" />

            <div className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-24 lg:grid-cols-2">

                {/* LEFT */}

                <div>

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/70 px-4 py-2 text-sm font-medium text-violet-700 backdrop-blur">
                        <Sparkles size={16} />
                        AI Powered Learning Platform
                    </div>

                    <h1 className="text-5xl font-black leading-tight text-slate-900 lg:text-7xl">

                        Learn{" "}

                        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            Smarter
                        </span>

                        <br />

                        Build Faster.

                    </h1>

                    <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">

                        Create personalized AI-powered learning roadmaps,
                        organize your skills, and track your journey with a
                        modern learning platform built for students and
                        developers.

                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">

                        <Link
                            href="/register"
                            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 font-semibold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                        >
                            Get Started
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            href="/login"
                            className="rounded-2xl border border-slate-300 bg-white/70 px-7 py-4 font-semibold text-slate-700 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            Live Demo
                        </Link>

                    </div>

                    <div className="mt-12 flex flex-wrap gap-8">

                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="text-green-500" />
                            Gemini AI
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="text-green-500" />
                            JWT Auth
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle2 className="text-green-500" />
                            MongoDB
                        </div>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="relative">

                    <div className="rounded-[32px] border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">

                        <div className="mb-8 flex items-center justify-between">

                            <div>

                                <h3 className="text-xl font-bold">
                                    Frontend Developer
                                </h3>

                                <p className="text-sm text-slate-500">
                                    AI Generated Roadmap
                                </p>

                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-3 text-white shadow-lg">
                                <Brain />
                            </div>

                        </div>

                        <div className="mb-8">

                            <div className="mb-2 flex justify-between text-sm">

                                <span>Progress</span>

                                <span>75%</span>

                            </div>

                            <div className="h-3 rounded-full bg-slate-200">

                                <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />

                            </div>

                        </div>

                        <div className="space-y-4">

                            {[
                                "HTML & CSS",
                                "JavaScript",
                                "React.js",
                                "TypeScript",
                                "Next.js",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
                                >
                                    <span>{item}</span>

                                    <CheckCircle2 className="text-green-500" />
                                </div>
                            ))}

                        </div>

                        <div className="mt-8 rounded-2xl bg-violet-100 p-4 text-sm text-violet-700">

                            🤖 Generated by Gemini AI

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}