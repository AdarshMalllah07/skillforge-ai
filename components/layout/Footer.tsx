import Link from "next/link";
import { Brain } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-white/20 bg-white/60 backdrop-blur-xl">

            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-8 md:flex-row">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                        <Brain size={24} />
                    </div>

                    <div>

                        <h3 className="text-lg font-bold text-slate-800">
                            SkillForge AI
                        </h3>

                        <p className="text-sm text-slate-500">
                            Built by Adarsh Mallah • Full Stack Developer Assignment
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-4">

                    <Link
                        href="https://github.com/AdarshMalllah07"
                        target="_blank"
                        className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        GitHub
                    </Link>

                    <Link
                        href="https://www.linkedin.com/in/adarsh-mallah-011279312/"
                        target="_blank"
                        className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        LinkedIn
                    </Link>

                </div>

            </div>

            <div className="border-t border-slate-200/70 py-4 text-center text-sm text-slate-500">
                © 2026 SkillForge AI • Crafted with Next.js, TypeScript, MongoDB & Gemini AI
            </div>

        </footer>
    );
}