import {
    Database,
    ShieldCheck,
    Sparkles,
    Cpu,
    Code2,
    LayoutDashboard,
} from "lucide-react";

export default function TechStackSection() {
    const techs = [
        {
            title: "Next.js 16",
            icon: LayoutDashboard,
            color: "from-black to-slate-700",
        },
        {
            title: "TypeScript",
            icon: Code2,
            color: "from-blue-600 to-cyan-500",
        },
        {
            title: "MongoDB",
            icon: Database,
            color: "from-green-600 to-emerald-500",
        },
        {
            title: "Gemini AI",
            icon: Sparkles,
            color: "from-violet-600 to-fuchsia-600",
        },
        {
            title: "JWT Auth",
            icon: ShieldCheck,
            color: "from-orange-500 to-red-500",
        },
        {
            title: "Tailwind CSS",
            icon: Cpu,
            color: "from-cyan-500 to-sky-500",
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-8 py-24">

            <div className="mb-14 text-center">

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    Modern Tech Stack
                </span>

                <h2 className="mt-6 text-4xl font-bold text-slate-900">
                    Built with Industry Standard Technologies
                </h2>

                <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
                    SkillForge AI is powered by a modern full-stack architecture
                    designed for scalability, performance, and an exceptional
                    user experience.
                </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {techs.map((tech) => {
                    const Icon = tech.icon;

                    return (
                        <div
                            key={tech.title}
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
                                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tech.color} text-white shadow-lg transition-transform group-hover:scale-110`}
                            >
                                <Icon size={30} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-800">
                                {tech.title}
                            </h3>

                            <p className="mt-3 text-slate-500">
                                Production-ready implementation following modern
                                development practices.
                            </p>

                        </div>
                    );
                })}

            </div>

        </section>
    );
}