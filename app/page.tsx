export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            SkillForge AI
          </h1>

          <nav className="flex gap-6 text-sm font-medium">
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>

            <a href="#about" className="hover:text-blue-600">
              About
            </a>

            <a href="/login" className="hover:text-blue-600">
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

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
            href="#features"
            className="rounded-xl border px-6 py-3 transition hover:bg-gray-100"
          >
            Explore Features
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
              Generate structured learning plans using Gemini AI based on your
              goals.
            </p>
          </div>

          <div className="rounded-2xl border p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-semibold">
              Progress Analytics
            </h4>

            <p className="text-gray-600">
              Visualize completed topics, pending goals and overall learning
              performance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="mt-20 border-t bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <h3 className="text-2xl font-bold">
            SkillForge AI
          </h3>

          <p className="mt-4 text-gray-600">
            AI Powered Learning Roadmap Manager built using Next.js 16,
            TypeScript, MongoDB and Gemini AI.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            © 2026 SkillForge AI. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}