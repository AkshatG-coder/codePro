import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "http://localhost:2358";

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
    default: return "PENDING";
  }
}

export async function pollTokens(tokens: string[]): Promise<Judge0Result[]> {
  if (!tokens.length) return [];
  const res = await axios.get(
    `${JUDGE0_URL}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,stdout,stderr,compile_output,status,time,memory`
  );
  return res.data.submissions;
}
