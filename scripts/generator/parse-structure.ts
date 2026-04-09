/**
 * structure.md parser
 * Parses a problem's structure.md into a typed config object
 *
 * Expected format:
 * # function: functionName
 * ## params
 * - paramName: type
 * ## return
 * - type
 */

export type ParamType =
  | "int" | "int[]" | "int[][]"
  | "float" | "float[]"
  | "string" | "string[]"
  | "bool" | "bool[]";

export interface Param {
  name: string;
  type: ParamType;
}

export interface ProblemStructure {
  functionName: string;
  params: Param[];
  returnType: ParamType;
}

export function parseStructure(markdown: string): ProblemStructure {
  const lines = markdown.split("\n").map(l => l.trim()).filter(Boolean);

  const fnLine = lines.find(l => l.toLowerCase().startsWith("# function:"));
  if (!fnLine) throw new Error("Missing '# function: ...' line in structure.md");
  const functionName = fnLine.split(":")[1].trim();

  const paramsIdx = lines.findIndex(l => l === "## params");
  const returnIdx = lines.findIndex(l => l === "## return");
  if (paramsIdx === -1) throw new Error("Missing '## params' section");
  if (returnIdx === -1) throw new Error("Missing '## return' section");

  const params: Param[] = [];
  for (let i = paramsIdx + 1; i < returnIdx; i++) {
    const line = lines[i];
    if (!line.startsWith("-")) continue;
    const parts = line.slice(1).trim().split(":");
    if (parts.length !== 2) continue;
    params.push({ name: parts[0].trim(), type: parts[1].trim() as ParamType });
  }

  const returnLine = lines[returnIdx + 1];
  if (!returnLine?.startsWith("-")) throw new Error("Missing return type in '## return'");
  const returnType = returnLine.slice(1).trim() as ParamType;

  return { functionName, params, returnType };
}
