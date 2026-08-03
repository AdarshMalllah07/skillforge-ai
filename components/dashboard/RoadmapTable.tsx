import {
    Pencil,
    Trash2,
    Sparkles,
} from "lucide-react";

interface Roadmap {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    progress: number;
    aiRoadmap: string;
}

interface Props {
    roadmaps: Roadmap[];
    loading: boolean;
    deleteRoadmap: (id: string) => void;
    editRoadmap: (roadmap: Roadmap) => void;
}

export default function RoadmapTable({
    roadmaps,
    loading,
    deleteRoadmap,
    editRoadmap,
}: Props) {
    if (loading) {
        return (
            <div className="mt-8 rounded-3xl border border-white/30 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
                <p className="text-center text-slate-500">
                    Loading Roadmaps...
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl backdrop-blur-xl">

            <div className="flex items-center justify-between border-b border-slate-200/70 px-8 py-6">

                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        My Roadmaps
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your learning journey
                    </p>
                </div>

                <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    {roadmaps.length} Roadmaps
                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead className="bg-slate-50/70">

                        <tr className="text-left text-sm uppercase tracking-wide text-slate-500">

                            <th className="px-8 py-4">Title</th>

                            <th className="px-8 py-4">Category</th>

                            <th className="px-8 py-4">Level</th>

                            <th className="px-8 py-4">Progress</th>

                            <th className="px-8 py-4 text-center">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {roadmaps.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="py-16 text-center text-slate-500"
                                >
                                    <Sparkles
                                        size={40}
                                        className="mx-auto mb-4 text-violet-500"
                                    />

                                    No Roadmaps Found
                                </td>

                            </tr>

                        ) : (

                            roadmaps.map((item) => (

                                <tr
                                    key={item._id}
                                    className="border-t border-slate-200/60 transition-all hover:bg-white/70"
                                >

                                    <td className="px-8 py-5">

                                        <div className="font-semibold text-slate-800">
                                            {item.title}
                                        </div>

                                    </td>

                                    <td className="px-8 py-5">

                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {item.category}
                                        </span>

                                    </td>

                                    <td className="px-8 py-5">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${item.level === "Beginner"
                                                ? "bg-green-100 text-green-700"
                                                : item.level === "Intermediate"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {item.level}
                                        </span>

                                    </td>

                                    <td className="px-8 py-5">

                                        <div className="flex items-center gap-3">

                                            <div className="h-2 w-32 rounded-full bg-slate-200">

                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                                    style={{
                                                        width: `${item.progress}%`,
                                                    }}
                                                />

                                            </div>

                                            <span className="text-sm font-medium text-slate-600">
                                                {item.progress}%
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-8 py-5">

                                        <div className="flex justify-center gap-3">

                                            <button
                                                onClick={() =>
                                                    editRoadmap(item)
                                                }
                                                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-600"
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm("Are you sure you want to delete this roadmap?")
                                                    ) {
                                                        deleteRoadmap(item._id);
                                                    }
                                                }}
                                                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-red-600"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}