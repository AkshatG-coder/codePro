import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type StandingRow = {
  user: { id: string; name: string | null; image: string | null };
  totalPoints: number;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchStandings(contestId: string) {
  return prisma.contestPoints.findMany({
    where: { contestId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { totalPoints: "desc" },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  const { contestId } = await params;

  // Verify contest exists and is active
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: { endTime: true, startTime: true },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Send initial standings immediately
      const initial = await fetchStandings(contestId);
      send({ standings: initial.map((e: StandingRow, i: number) => ({ rank: i + 1, user: e.user, totalPoints: e.totalPoints })) });

      // If contest is still active, keep streaming every 5s
      const isActive = contest && new Date() < contest.endTime;
      if (!isActive) {
        controller.close();
        return;
      }

      const intervalId = setInterval(async () => {
        try {
          const standings = await fetchStandings(contestId);
          send({
            standings: standings.map((e: StandingRow, i: number) => ({
              rank: i + 1,
              user: e.user,
              totalPoints: e.totalPoints,
            })),
          });

          // Stop streaming if contest has ended
          if (new Date() > contest.endTime) {
            clearInterval(intervalId);
            controller.close();
          }
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 5000); // push every 5 seconds

      // Cleanup when client disconnects
      _req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // important for nginx proxies
    },
  });
}
