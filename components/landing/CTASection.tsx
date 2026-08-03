import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative overflow-hidden py-28">

            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900" />

            {/* Decorative Blur */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[120px]" />

            <div className="mx-auto max-w-5xl px-8">

                <div
                    className="
                        rounded-[36px]
                        border
                        border-white/10
                        bg-slate-900/20
                        p-12
                        text-center
                        shadow-[0_30px_80px_rgba(0,0,0,.25)]
                        backdrop-blur-2xl
                    "
                >

                    {/* Icon */}

                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg">

                        <Sparkles size={32} />

                    </div>

                    {/* Heading */}

                    <h2 className="text-5xl font-black leading-tight text-white md:text-6xl">

                        Ready to Build

                        <br />

                        Your Future?

                    </h2>

                    {/* Description */}

                    <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/85">

                        Create AI-powered learning roadmaps, organize your
                        learning goals, track your progress, and become
                        industry-ready with SkillForge AI.

                    </p>

                    {/* Buttons */}

                    <div className="mt-12 flex flex-wrap justify-center gap-5">

                        <Link
                            href="/register"
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-white
                                px-8
                                py-4
                                font-semibold
                                text-slate-900
                                shadow-xl
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-2xl
                            "
                        >
                            Start Building

                            <ArrowRight size={18} />

                        </Link>

                        <Link
                            href="/login"
                            className="
                                rounded-2xl
                                border
                                border-white/20
                                bg-white/10
                                px-8
                                py-4
                                font-semibold
                                text-white
                                backdrop-blur
                                transition-all
                                duration-300
                                hover:bg-white/20
                            "
                        >
                            Explore Dashboard
                        </Link>

                    </div>

                    {/* Bottom Features */}

                    <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-white/80">

                        <span>✨ AI Powered</span>

                        <span>🔒 Secure Authentication</span>

                        <span>📈 Progress Tracking</span>

                        <span>⚡ Responsive Design</span>

                    </div>

                </div>

            </div>

        </section>
    );
}