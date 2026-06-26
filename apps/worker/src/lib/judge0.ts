import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "http://localhost:2358";

// When RAPIDAPI_KEY is set, we route through the public Judge0 cloud API.
// When it is empty, we talk directly to a self-hosted Judge0 instance.
const rapidApiHeaders = process.env.RAPIDAPI_KEY
  ? {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }
  : {};

export interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export function mapStatus(statusId: number): string {
  switch (statusId) {
    case 3:  return "AC";
    case 4:  return "WA";
    case 5:  return "TLE";
    case 6:  return "CE";
    case 7: case 8: case 9: case 10: case 11: case 12: return "RE";
    case 13: return "SE"; // Internal Error
    case 14: return "SE"; // Exec Format Error
    default: return "SE"; // Unknown/expired token — treat as system error, not PENDING
  }
}

export async function pollTokens(tokens: string[]): Promise<Judge0Result[]> {
  if (!tokens.length) return [];
  const res = await axios.get(
    `${JUDGE0_URL}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,stdout,stderr,compile_output,status,time,memory`,
    { headers: { "Content-Type": "application/json", ...rapidApiHeaders } }
  );
  // Filter out null entries — Judge0 returns null for expired/missing tokens
  return (res.data.submissions as (Judge0Result | null)[]).filter((s): s is Judge0Result => s !== null);
}

