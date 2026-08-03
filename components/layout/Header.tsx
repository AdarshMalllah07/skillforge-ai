"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

                <Link
                    href="/"
                    className="text-2xl font-bold text-blue-600"
                >
                    SkillForge AI
                </Link>

                <nav className="flex items-center gap-6">

                    <Link href="/">
                        Home
                    </Link>

                    {pathname === "/dashboard" ? (
                        <>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </nav>
            </div>
        </header>
    );
}