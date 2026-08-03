interface Props {
  form: {
    title: string;
    description: string;
    category: string;
    level: string;
  };
  setForm: any;
  createRoadmap: () => void;
}

export default function RoadmapForm({
  form,
  setForm,
  createRoadmap,
}: Props) {
  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow">

      <h2 className="mb-5 text-2xl font-bold">
        Create Roadmap
      </h2>

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
          rows={4}
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
          className="rounded-lg bg-blue-600 text-white"
        >
          Save Roadmap
        </button>

      </div>

    </div>
  );
}