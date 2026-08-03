"use client";

import { useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
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

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
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
        await fetch("/api/roadmaps", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        setForm({
            title: "",
            description: "",
            category: "",
            level: "Beginner",
        });

        loadRoadmaps();
    };

    const deleteRoadmap = async (id: string) => {
        await fetch(`/api/roadmaps/${id}`, {
            method: "DELETE",
        });

        loadRoadmaps();
    };

    return (
        <>
            <DashboardHeader />

            <main className="min-h-screen bg-slate-100 p-8">

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
                />


                <RoadmapTable
                    roadmaps={roadmaps}
                    loading={loading}
                    deleteRoadmap={deleteRoadmap}
                />



            </main>
        </>
    );
}