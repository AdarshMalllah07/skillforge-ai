import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Roadmap from "@/models/Roadmap";

export async function GET() {
    try {
        await connectDB();

        const roadmaps = await Roadmap.find().sort({
            createdAt: -1,
        });

        return NextResponse.json(roadmaps);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Failed to fetch roadmaps",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        const roadmap = await Roadmap.create({
            title: body.title,
            description: body.description,
            category: body.category,
            level: body.level,
            progress: 0,
            aiRoadmap: body.description,
        });

        return NextResponse.json(roadmap, {
            status: 201,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Failed to create roadmap",
            },
            {
                status: 500,
            }
        );
    }
}