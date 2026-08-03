interface Props {
    form: {
        title: string;
        description: string;
        category: string;
        level: string;
    };
    setForm: any;
    createRoadmap: () => void;
    generateAIRoadmap: () => void;
    aiLoading: boolean;
}

export default function RoadmapForm({
    form,
    setForm,
    createRoadmap,
    generateAIRoadmap,
    aiLoading,
}: Props) {
    return (
        <div className="mt-8 rounded-xl bg-white p-6 shadow">

            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    Create Roadmap
                </h2>

                <button
                    onClick={generateAIRoadmap}
                    disabled={aiLoading}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                    {aiLoading
                        ? "Generating..."
                        : "✨ Generate AI Roadmap"}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

                <input
                    placeholder="Title"
                    className="rounded-lg border p-3"
                    value={form.title}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            title: e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Category"
                    className="rounded-lg border p-3"
                    value={form.category}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            category: e.target.value,
                        })
                    }
                />

                <textarea
                    placeholder="Description"
                    rows={8}
                    className="rounded-lg border p-3 md:col-span-2"
                    value={form.description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            description: e.target.value,
                        })
                    }
                />

                <select
                    className="rounded-lg border p-3"
                    value={form.level}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            level: e.target.value,
                        })
                    }
                >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </select>

                <button
                    onClick={createRoadmap}
                    className="rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                >
                    Save Roadmap
                </button>

            </div>

        </div>
    );
}