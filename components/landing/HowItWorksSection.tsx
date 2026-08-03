import {
    Target,
    Brain,
    BookOpen,
    Rocket,
} from "lucide-react";

export default function HowItWorksSection() {
    const steps = [
        {
            title: "Define Your Goal",
            description:
                "Choose the technology or career path you want to master.",
            icon: Target,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Generate AI Roadmap",
            description:
                "Gemini AI creates a structured learning roadmap tailored to your goals.",
            icon: Brain,
            color: "from-violet-500 to-fuchsia-600",
        },
        {
            title: "Learn & Track Progress",
            description:
                "Complete each milestone and monitor your learning journey.",
            icon: BookOpen,
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "Become Job Ready",
            description:
                "Finish your roadmap with confidence and build industry-ready skills.",
            icon: Rocket,
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <section className="mx-auto max-w-5xl px-8 py-24">

            <div className="mb-20 text-center">

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    How It Works
                </span>

                <h2 className="mt-6 text-4xl font-bold text-slate-900">
                    Your Learning Journey
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
                    From setting your goal to becoming job-ready,
                    SkillForge AI guides every step of your journey.
                </p>

            </div>

            <div className="relative">

                <div className="absolute left-8 top-0 h-full w-1 rounded-full bg-gradient-to-b from-blue-500 via-violet-500 to-orange-500" />

                <div className="space-y-12">

                    {steps.map((step) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="relative flex items-start gap-8"
                            >

                                <div
                                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-xl`}
                                >
                                    <Icon size={28} />
                                </div>

                                <div className="flex-1 rounded-3xl border border-white/30 bg-white/60 p-8 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl">

                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {step.title}
                                    </h3>

                                    <p className="mt-4 leading-7 text-slate-600">
                                        {step.description}
                                    </p>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}