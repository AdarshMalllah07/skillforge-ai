import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Roadmap from "@/models/Roadmap";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const body = await req.json();
    const { id } = await params;

    const roadmap = await Roadmap.findByIdAndUpdate(id, body, {
        new: true,
    });

    return NextResponse.json(roadmap);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const { id } = await params;

    await Roadmap.findByIdAndDelete(id);

    return NextResponse.json({
        success: true,
    });
}