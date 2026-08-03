import {
  BookOpen,
  Brain,
  Layers3,
  Save,
  Sparkles,
} from "lucide-react";

interface Props {
  form: {
    title: string;
    description: string;
    category: string;
    level: string;
    progress: number;
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
    <div className="mt-8 overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl backdrop-blur-xl">

      <div className="flex items-center justify-between border-b border-slate-200/70 px-8 py-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <BookOpen className="text-blue-600" />
            Create Learning Roadmap
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create personalized learning paths with AI assistance.
          </p>

        </div>

        <button
          onClick={generateAIRoadmap}
          disabled={aiLoading}
          className="
                        flex items-center gap-2
                        rounded-2xl
                        bg-gradient-to-r
                        from-violet-600
                        to-fuchsia-600
                        px-5
                        py-3
                        font-medium
                        text-white
                        shadow-lg
                        transition-all
                        hover:-translate-y-0.5
                        hover:shadow-xl
                        disabled:opacity-50
                    "
        >
          <Brain size={18} />

          {aiLoading
            ? "Generating..."
            : "Generate AI"}
        </button>

      </div>

      <div className="grid gap-6 p-8 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Roadmap Title
          </label>

          <input
            placeholder="React Developer"
            className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white/70
                            px-4
                            py-3
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-100
                        "
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Category
          </label>

          <input
            placeholder="Frontend"
            className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white/70
                            px-4
                            py-3
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-100
                        "
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

        </div>

        <div className="md:col-span-2">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description / AI Roadmap
          </label>

          <textarea
            rows={8}
            placeholder="Describe your learning goals..."
            className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white/70
                            px-4
                            py-3
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-100
                        "
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

        </div>
        <div className="md:col-span-2">

          <div className="mb-3 flex items-center justify-between">

            <label className="text-sm font-semibold text-slate-700">
              Learning Progress
            </label>

            <span className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-sm font-semibold text-white">
              {form.progress}%
            </span>

          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={form.progress}
            onChange={(e) =>
              setForm({
                ...form,
                progress: Number(e.target.value),
              })
            }
            className="
            h-2
            w-full
            cursor-pointer
            appearance-none
            rounded-full
            bg-slate-200
            accent-blue-600
        "
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>

        </div>
        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Difficulty Level
          </label>

          <div className="relative">

            <Layers3
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <select
              className="
                                w-full
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white/70
                                py-3
                                pl-11
                                pr-4
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-100
                            "
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

          </div>

        </div>

        <div className="flex items-end">

          <button
            onClick={createRoadmap}
            className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            bg-gradient-to-r
                            from-blue-600
                            to-cyan-600
                            py-3
                            font-semibold
                            text-white
                            shadow-lg
                            transition-all
                            hover:-translate-y-0.5
                            hover:shadow-xl
                        "
          >
            <Save size={18} />
            {form.progress > 0 ? "Update Roadmap" : "Save Roadmap"}
          </button>

        </div>

      </div>

      <div className="border-t border-slate-200/70 bg-slate-50/50 px-8 py-4">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <Sparkles
            size={16}
            className="text-violet-500"
          />

          Gemini AI can automatically generate a structured learning roadmap based on your title and goals.

        </div>

      </div>

    </div>
  );
}