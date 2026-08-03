import {
    Brain,
    BookOpen,
    ShieldCheck,
    BarChart3,
} from "lucide-react";

export default function FeaturesSection() {
    const features = [
        {
            title: "AI Roadmap Generation",
            description:
                "Generate personalized learning roadmaps powered by Gemini AI based on your career goals.",
            icon: Brain,
            color: "from-violet-500 to-fuchsia-600",
        },
        {
            title: "Progress Tracking",
            description:
                "Monitor your learning progress and stay motivated with structured milestones.",
            icon: BarChart3,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Roadmap Management",
            description:
                "Create, edit, update and organize multiple learning roadmaps from one dashboard.",
            icon: BookOpen,
            color: "from-green-500 to-emerald-600",
        },
        {
            title: "Secure Authentication",
            description:
                "JWT-based authentication keeps your learning data secure and protected.",
            icon: ShieldCheck,
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-8 py-24">

            <div className="mb-16 text-center">

                <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                    Everything You Need
                </span>

                <h2 className="mt-6 text-4xl font-bold text-slate-900">
                    Powerful Features,
                    <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                        {" "}Simple Experience
                    </span>
                </h2>

                <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
                    SkillForge AI combines modern technologies with AI to
                    simplify your learning journey from beginner to professional.
                </p>

            </div>

            <div className="grid gap-8 md:grid-cols-2">

                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.title}
                            className="
                                group
                                rounded-3xl
                                border
                                border-white/30
                                bg-white/60
                                p-8
                                shadow-lg
                                backdrop-blur-xl
                                transition-all
                                duration-300
                                hover:-translate-y-2
                                hover:shadow-2xl
                            "
                        >

                            <div
                                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                            >
                                <Icon size={30} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900">
                                {feature.title}
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                {feature.description}
                            </p>

                        </div>
                    );
                })}

            </div>

        </section>
    );
}