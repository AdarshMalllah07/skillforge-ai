"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Brain,
    Home,
    LogIn,
    LogOut,
    UserPlus,
} from "lucide-react";

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
        <header
            className="
                sticky
                top-0
                z-50
                border-b
                border-white/20
                bg-white/70
                backdrop-blur-xl
                shadow-lg
            "
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

                <Link
                    href="/"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
                        <Brain size={22} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            SkillForge AI
                        </h1>

                        <p className="text-xs text-slate-500">
                            AI Learning Platform
                        </p>
                    </div>
                </Link>

                <nav className="flex items-center gap-3">

                    <Link
                        href="/"
                        className={`
                            flex items-center gap-2 rounded-xl px-4 py-2 transition-all
                            ${pathname === "/"
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-600 hover:bg-white hover:shadow"
                            }
                        `}
                    >
                        <Home size={18} />
                        Home
                    </Link>

                    {pathname === "/dashboard" ? (
                        <button
                            onClick={handleLogout}
                            className="
                                flex items-center gap-2
                                rounded-xl
                                bg-red-500
                                px-4
                                py-2
                                text-white
                                shadow-md
                                transition-all
                                hover:-translate-y-0.5
                                hover:bg-red-600
                            "
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="
                                    flex items-center gap-2
                                    rounded-xl
                                    px-4
                                    py-2
                                    text-slate-600
                                    transition-all
                                    hover:bg-white
                                    hover:shadow
                                "
                            >
                                <LogIn size={18} />
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="
                                    flex items-center gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-violet-600
                                    px-5
                                    py-2
                                    font-medium
                                    text-white
                                    shadow-lg
                                    transition-all
                                    hover:-translate-y-0.5
                                    hover:shadow-xl
                                "
                            >
                                <UserPlus size={18} />
                                Register
                            </Link>
                        </>
                    )}

                </nav>

            </div>
        </header>
    );
}