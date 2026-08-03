import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { title, description, level } = await req.json();

        const prompt = `
Create a detailed learning roadmap.

Title: ${title}

Description: ${description}

Level: ${level}

Return:
- Week wise roadmap
- Topics
- Projects
- Resources
- Keep response clean markdown.
`;

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
        });

        return NextResponse.json({
            success: true,
            roadmap: response.text,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "AI generation failed",
            },
            {
                status: 500,
            }
        );
    }
}