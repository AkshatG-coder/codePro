import type { ProblemStructure, ParamType } from "./parse-structure";

// ── Type mappings ──────────────────────────────────────────────────

function cppType(t: ParamType): string {
  switch (t) {
    case "int":      return "int";
    case "int[]":    return "vector<int>";
    case "int[][]":  return "vector<vector<int>>";
    case "float":    return "double";
    case "float[]":  return "vector<double>";
    case "string":   return "string";
    case "string[]": return "vector<string>";
    case "bool":     return "bool";
    case "bool[]":   return "vector<bool>";
    default:         return "auto";
  }
}

// ── Read a single value from stdin ────────────────────────────────

function readCppScalar(t: ParamType, varName: string): string {
  switch (t) {
    case "int":    return `int ${varName}; cin >> ${varName};`;
    case "float":  return `double ${varName}; cin >> ${varName};`;
    case "string": return `string ${varName}; cin >> ${varName};`;
    case "bool":   return `bool ${varName}; cin >> ${varName};`;
    default:       return `// TODO: read ${varName}`;
  }
}

function readCppVector(t: "int[]" | "float[]" | "string[]" | "bool[]", varName: string): string {
  const inner = t.replace("[]", "") as ParamType;
  const ct    = cppType(inner);
  return [
    `int n_${varName}; cin >> n_${varName};`,
    `${cppType(t)} ${varName}(n_${varName});`,
    `for (auto &x : ${varName}) cin >> x;`,
  ].join("\n    ");
}

function readCppMatrix(varName: string): string {
  return [
    `int r_${varName}, c_${varName}; cin >> r_${varName} >> c_${varName};`,
    `vector<vector<int>> ${varName}(r_${varName}, vector<int>(c_${varName}));`,
    `for (auto &row : ${varName}) for (auto &x : row) cin >> x;`,
  ].join("\n    ");
}

function readCppParam(name: string, t: ParamType): string {
  if (t === "int[][]") return readCppMatrix(name);
  if (t.endsWith("[]"))  return readCppVector(t as any, name);
  return readCppScalar(t, name);
}

// ── Print result ──────────────────────────────────────────────────

function printCppResult(t: ParamType): string {
  switch (t) {
    case "int[]":
    case "float[]":
    case "bool[]":
      return `for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "");`;
    case "int[][]":
      return `for (auto &row : result) { for (size_t i = 0; i < row.size(); i++) cout << row[i] << (i + 1 < row.size() ? " " : ""); cout << "\\n"; }`;
    case "bool":
      return `cout << (result ? "true" : "false");`;
    default:
      return `cout << result;`;
  }
}

// ── Generators ────────────────────────────────────────────────────

export function generateCppPartial(s: ProblemStructure): string {
  const params = s.params.map(p => `${cppType(p.type)} ${p.name}`).join(", ");
  return `${cppType(s.returnType)} ${s.functionName}(${params}) {\n    // Your code here\n}`;
}

export function generateCppFull(s: ProblemStructure): string {
  const reads = s.params.map(p => `    ${readCppParam(p.name, p.type)}`).join("\n");
  const callArgs = s.params.map(p => p.name).join(", ");
  const print = printCppResult(s.returnType);

  return `#include <bits/stdc++.h>
using namespace std;

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

${reads}

    auto result = ${s.functionName}(${callArgs});
    ${print}
    cout << endl;
    return 0;
}`;
}
