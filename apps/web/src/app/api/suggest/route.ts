import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title:         z.string().min(3).max(200),
  difficulty:    z.enum(["EASY", "MEDIUM", "HARD"]),
  description:   z.string().min(20),
  tags:          z.array(z.string()).max(5).default([]),
  sampleInput:   z.string().optional(),
  sampleOutput:  z.string().optional(),
  githubUsername:z.string().optional(),
  referenceLink: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = schema.parse(body);

    const suggestion = await prisma.problemSuggestion.create({
      data: {
        ...data,
        referenceLink: data.referenceLink || null,
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, id: suggestion.id }, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // Public: list approved/merged suggestions so community can see what's coming
  const suggestions = await prisma.problemSuggestion.findMany({
    where: { status: { in: ["APPROVED", "MERGED"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, difficulty: true, tags: true,
      status: true, prLink: true, createdAt: true, githubUsername: true,
    },
  });
  return NextResponse.json({ success: true, data: suggestions });
}
