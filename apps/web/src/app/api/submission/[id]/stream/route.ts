import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchSubmission(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      submissionTestCases: {
        include: { testCase: { select: { input: true, expectedOutput: true, isHidden: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: submissionId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Helper to check if submission is finalized
      const isFinalized = (sub: { status: string; submissionTestCases: { status: string }[] } | null) => {
        if (!sub) return true; // not found, consider done
        if (sub.status !== "PENDING") return true;
        // Check if all testcases are resolved
        const allDone = sub.submissionTestCases.every((tc) => tc.status !== "PENDING");
        return allDone;
      };

      // 1. Initial send
      const currentSub = await fetchSubmission(submissionId);
      send({ success: true, data: currentSub });

      if (isFinalized(currentSub)) {
        controller.close();
        return;
      }

      // 2. Subscribe to Redis for updates
      const channel = `submission:${submissionId}`;
      const subscriber = redis.duplicate();

      subscriber.on("message", async (chan, message) => {
        if (chan === channel) {
          try {
            const updatedSub = await fetchSubmission(submissionId);
            send({ success: true, data: updatedSub });

            if (isFinalized(updatedSub)) {
              subscriber.quit();
              controller.close();
            }
          } catch (err) {
            console.error("Error in SSE redis subscriber", err);
            subscriber.quit();
            controller.close();
          }
        }
      });

      subscriber.subscribe(channel, (err) => {
        if (err) {
          console.error("Failed to subscribe to Redis:", err);
        }
      });

      // 3. Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        subscriber.quit();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
