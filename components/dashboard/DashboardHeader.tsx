"use client";

import { useRouter } from "next/navigation";

export default function DashboardHeader() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            console.log("Logout Status:", res.status);

            router.replace("/login");
            router.refresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">
                        SkillForge AI
                    </h1>

                    <p className="text-gray-500">
                        AI Learning Roadmap Manager
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}