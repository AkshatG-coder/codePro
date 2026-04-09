import axios from "axios";
import { env } from "../config/env";

const judge0 = axios.create({
  baseURL: env.JUDGE0_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Judge0 language IDs
export const LANGUAGE_IDS = {
  cpp: 54,       // G++ 9.2.0
  javascript: 63, // Node.js 12.14.0
  rust: 73,      // Rust 1.40.0
} as const;

export type LanguageKey = keyof typeof LANGUAGE_IDS;

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
}

export interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

/**
 * Map Judge0 status_id to our SubmissionStatus enum
 */
export function mapJudge0Status(statusId: number): string {
  switch (statusId) {
    case 3:  return "AC";   // Accepted
    case 4:  return "WA";   // Wrong Answer
    case 5:  return "TLE";  // Time Limit Exceeded
    case 6:  return "CE";   // Compilation Error
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12: return "RE";   // Runtime Error (various)
    case 13: return "SE";   // Internal Error
    case 14: return "SE";   // Exec Format Error
    default: return "PENDING";
  }
}

/**
 * Submit a batch of test cases to Judge0
 */
export async function submitBatch(
  submissions: Judge0Submission[]
): Promise<{ token: string }[]> {
  const response = await judge0.post("/submissions/batch", {
    submissions,
  });
  return response.data;
}

/**
 * Poll Judge0 for a batch of tokens
 */
export async function getBatchResults(
  tokens: string[]
): Promise<Judge0Result[]> {
  const tokenStr = tokens.join(",");
  const response = await judge0.get(
    `/submissions/batch?tokens=${tokenStr}&base64_encoded=false&fields=token,stdout,stderr,compile_output,status,time,memory`
  );
  return response.data.submissions;
}
