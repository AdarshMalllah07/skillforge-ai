import {
    BookOpen,
    CheckCircle2,
    Clock3,
    Sparkles,
} from "lucide-react";

interface Props {
    total: number;
    completed: number;
    progress: number;
    ai: number;
}

export default function DashboardStats({
    total,
    completed,
    progress,
    ai,
}: Props) {
    const cards = [
        {
            title: "Total Roadmaps",
            subtitle: "All learning plans",
            value: total,
            color: "text-blue-600",
            bg: "from-blue-500 to-cyan-500",
            icon: BookOpen,
        },
        {
            title: "Completed",
            subtitle: "Successfully finished",
            value: completed,
            color: "text-green-600",
            bg: "from-green-500 to-emerald-500",
            icon: CheckCircle2,
        },
        {
            title: "In Progress",
            subtitle: "Currently learning",
            value: progress,
            color: "text-orange-500",
            bg: "from-orange-500 to-amber-500",
            icon: Clock3,
        },
        {
            title: "AI Generated",
            subtitle: "Powered by Gemini",
            value: ai,
            color: "text-violet-600",
            bg: "from-violet-500 to-fuchsia-500",
            icon: Sparkles,
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-3xl
                            border border-white/30
                            bg-white/60
                            p-6
                            shadow-lg
                            backdrop-blur-xl
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-2xl
                        "
                    >
                        {/* Background Glow */}
                        <div
                            className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${card.bg} opacity-10 blur-3xl`}
                        />

                        <div className="relative flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {card.subtitle}
                                </p>

                                <h2
                                    className={`mt-5 text-5xl font-bold ${card.color}`}
                                >
                                    {card.value}
                                </h2>
                            </div>

                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.bg} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                            >
                                <Icon size={28} />
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}