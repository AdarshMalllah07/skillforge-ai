import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Roadmap from "@/models/Roadmap";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(
    req: NextRequest,
    context: RouteContext
) {
    await connectDB();

    const body = await req.json();
    const { id } = await context.params;

    const roadmap = await Roadmap.findByIdAndUpdate(
        id,
        body,
        {
            new: true,
            runValidators: true,
        }
    );

    return NextResponse.json(roadmap);
}

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    await connectDB();

    const { id } = await context.params;

    await Roadmap.findByIdAndDelete(id);

    return NextResponse.json({
        success: true,
    });
}