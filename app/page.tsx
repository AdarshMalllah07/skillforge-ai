export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          AI Powered Learning Platform
        </span>

        <h2 className="mt-8 max-w-4xl text-5xl font-bold leading-tight">
          Build Smarter Learning Roadmaps with AI
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          SkillForge helps students and developers create structured learning
          paths, track progress, and receive AI-powered recommendations to
          accelerate their career growth.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/register"
            className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            Start Learning
          </a>

          <a
            href="/login"
            className="rounded-xl border px-6 py-3 transition hover:bg-gray-100"
          >
            Login
          </a>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <h3 className="mb-12 text-center text-4xl font-bold">
          Core Features
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-semibold">
              Learning Roadmaps
            </h4>

            <p className="text-gray-600">
              Create, organize and manage personalized learning paths with
              progress tracking.
            </p>
          </div>

          <div className="rounded-2xl border p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-semibold">
              AI Recommendations
            </h4>

            <p className="text-gray-600">
              Generate structured learning plans using AI based on your
              learning goals.
            </p>
          </div>

          <div className="rounded-2xl border p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-semibold">
              Progress Analytics
            </h4>

            <p className="text-gray-600">
              Visualize completed topics, pending goals, and overall learning
              progress.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}