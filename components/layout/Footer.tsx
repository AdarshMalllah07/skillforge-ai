import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-10 border-t bg-slate-900 text-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-8 py-8 md:flex-row">

                <div>
                    <h3 className="text-xl font-bold">
                        Adarsh Mallah
                    </h3>

                    <p className="text-sm text-gray-400">
                        SkillForge AI • Full Stack Developer Assignment
                    </p>
                </div>

                <div className="flex gap-6">

                    <Link
                        href="https://github.com/AdarshMalllah07"
                        target="_blank"
                        className="hover:text-blue-400"
                    >
                        GitHub
                    </Link>

                    <Link
                        href="https://www.linkedin.com/in/adarsh-mallah-011279312/"
                        target="_blank"
                        className="hover:text-blue-400"
                    >
                        LinkedIn
                    </Link>

                </div>

            </div>
        </footer>
    );
}