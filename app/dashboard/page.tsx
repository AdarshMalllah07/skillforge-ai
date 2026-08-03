"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RoadmapForm from "@/components/dashboard/RoadmapForm";
import RoadmapTable from "@/components/dashboard/RoadmapTable";

interface Roadmap {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    progress: number;
    aiRoadmap: string;
}

export default function DashboardPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        progress: 0,
    });

    const loadRoadmaps = async () => {
        const res = await fetch("/api/roadmaps");
        const data = await res.json();

        setRoadmaps(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRoadmaps();
    }, []);

    const createRoadmap = async () => {
        try {
            const res = await fetch("/api/roadmaps", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                toast.error("Failed to create roadmap.");
                return;
            }

            toast.success("Roadmap created successfully!");

            setForm({
                title: "",
                description: "",
                category: "",
                level: "Beginner",
                progress: 0,
            });

            loadRoadmaps();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        }
    };

    const deleteRoadmap = async (id: string) => {
        try {
            const res = await fetch(`/api/roadmaps/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                toast.error("Failed to delete roadmap.");
                return;
            }

            toast.success("Roadmap deleted.");

            loadRoadmaps();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        }

    };
    const editRoadmap = (roadmap: Roadmap) => {
        setEditingId(roadmap._id);

        setForm({
            title: roadmap.title,
            description: roadmap.description,
            category: roadmap.category,
            level: roadmap.level,
            progress: roadmap.progress,
        });
    };

    const saveRoadmap = async () => {
        if (!editingId) return;

        try {
            const res = await fetch(`/api/roadmaps/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                toast.error("Failed to update roadmap.");
                return;
            }

            toast.success("Roadmap updated successfully!");

            setEditingId(null);

            setForm({
                title: "",
                description: "",
                category: "",
                level: "Beginner",
                progress: 0,
            });

            loadRoadmaps();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        }
    };

    const generateAIRoadmap = async () => {
        if (!form.title) {
            toast.warning("Please enter a roadmap title first.");
            return;
        }

        try {
            setAiLoading(true);

            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to generate AI roadmap.");
                return;
            }

            setForm((prev) => ({
                ...prev,
                description: data.roadmap,
            }));

            toast.success("AI roadmap generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate AI roadmap.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <main
            className="
        min-h-screen
        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-violet-100
        p-8
    "
        >

            <DashboardStats
                total={roadmaps.length}
                completed={
                    roadmaps.filter(
                        (r) => r.progress === 100
                    ).length
                }
                progress={
                    roadmaps.filter(
                        (r) => r.progress < 100
                    ).length
                }
                ai={
                    roadmaps.filter(
                        (r) => r.aiRoadmap
                    ).length
                }
            />

            <RoadmapForm
                form={form}
                setForm={setForm}
                createRoadmap={
                    editingId
                        ? saveRoadmap
                        : createRoadmap
                }
                generateAIRoadmap={generateAIRoadmap}
                aiLoading={aiLoading}
            />

            <RoadmapTable
                roadmaps={roadmaps}
                loading={loading}
                deleteRoadmap={deleteRoadmap}
                editRoadmap={editRoadmap}
            />

        </main>
    );
}