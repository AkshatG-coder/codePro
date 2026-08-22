import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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
      const isFinalized = (sub: any) => {
        if (!sub) return true; // not found, consider done
        if (sub.status !== "PENDING") return true;
        // Check if all testcases are resolved
        const allDone = sub.submissionTestCases.every((tc: any) => tc.status !== "PENDING");
        return allDone;
      };

      // 1. Initial send
      let currentSub = await fetchSubmission(submissionId);
      send({ success: true, data: currentSub });

      if (isFinalized(currentSub)) {
        controller.close();
        return;
      }

      // 2. Poll DB every 1 second (internal polling, no network overhead for client)
      const intervalId = setInterval(async () => {
        try {
          const updatedSub = await fetchSubmission(submissionId);
          
          // Basic optimization: only send if something changed
          // Since we update timestamps, we can just stringify and compare
          // Or just always send it because SSE is lightweight
          send({ success: true, data: updatedSub });

          if (isFinalized(updatedSub)) {
            clearInterval(intervalId);
            controller.close();
          }
        } catch (err) {
          clearInterval(intervalId);
          controller.close();
        }
      }, 1000);

      // 3. Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
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
      "X-Accel-Buffering": "no",
    },
  });
}
