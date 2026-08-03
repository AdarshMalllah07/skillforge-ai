"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Login failed.");
                return;
            }

            toast.success("Login successful. Welcome back!");

            setTimeout(() => {
                router.push("/dashboard");
            }, 600);

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-violet-100 px-4">

            <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">

                <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
                    Welcome Back
                </h1>

                <p className="mb-8 text-center text-slate-500">
                    Login to continue your learning journey.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>

                        <label className="mb-2 block font-medium text-slate-700">
                            Email
                        </label>

                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            required
                        />

                    </div>

                    <div>

                        <label className="mb-2 block font-medium text-slate-700">
                            Password
                        </label>

                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="********"
                            className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Logging in...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Login
                            </>
                        )}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{" "}
                    <a
                        href="/register"
                        className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Register
                    </a>
                </p>

            </div>

        </main>
    );
}