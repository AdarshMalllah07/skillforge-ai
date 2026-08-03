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

    const navClass = (active: boolean) =>
        `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${active
            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
            : "text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-md"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-2xl shadow-lg">

            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

                {/* Logo */}

                <Link
                    href="/"
                    className="group flex items-center gap-3"
                >

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-600
                            via-violet-600
                            to-fuchsia-600
                            text-white
                            shadow-lg
                            transition-transform
                            duration-300
                            group-hover:scale-105
                        "
                    >
                        <Brain size={24} />
                    </div>

                    <div>

                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                            SkillForge AI
                        </h1>

                        <p className="text-xs text-slate-500">
                            AI Learning Roadmap Platform
                        </p>

                    </div>

                </Link>

                {/* Navigation */}

                <nav className="flex items-center gap-3">

                    <Link
                        href="/"
                        className={navClass(pathname === "/")}
                    >
                        <Home size={18} />
                        Home
                    </Link>

                    {pathname === "/dashboard" ? (

                        <button
                            onClick={handleLogout}
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-red-500
                                to-rose-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:shadow-xl
                            "
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

                    ) : (

                        <>
                            <Link
                                href="/login"
                                className={navClass(pathname === "/login")}
                            >
                                <LogIn size={18} />
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    via-violet-600
                                    to-fuchsia-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    transition-all
                                    duration-300
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