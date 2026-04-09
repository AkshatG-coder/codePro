import type { ProblemStructure, ParamType } from "./parse-structure";

function rustType(t: ParamType): string {
  switch (t) {
    case "int":     return "i64";
    case "int[]":   return "Vec<i64>";
    case "int[][]": return "Vec<Vec<i64>>";
    case "float":   return "f64";
    case "float[]": return "Vec<f64>";
    case "string":  return "String";
    case "string[]":return "Vec<String>";
    case "bool":    return "bool";
    case "bool[]":  return "Vec<bool>";
    default:        return "String";
  }
}

function readRustParam(name: string, t: ParamType): string {
  switch (t) {
    case "int":    return `let ${name}: i64 = next_line().trim().parse().unwrap();`;
    case "float":  return `let ${name}: f64 = next_line().trim().parse().unwrap();`;
    case "string": return `let ${name}: String = next_line().trim().to_string();`;
    case "bool":   return `let ${name}: bool = next_line().trim() == "true";`;
    case "int[]":  return `let _n_${name}: usize = next_line().trim().parse().unwrap();\nlet ${name}: Vec<i64> = next_line().split_whitespace().map(|x| x.parse().unwrap()).collect();`;
    case "float[]":return `let _n_${name}: usize = next_line().trim().parse().unwrap();\nlet ${name}: Vec<f64> = next_line().split_whitespace().map(|x| x.parse().unwrap()).collect();`;
    case "string[]":return `let _n_${name}: usize = next_line().trim().parse().unwrap();\nlet ${name}: Vec<String> = next_line().split_whitespace().map(String::from).collect();`;
    default:       return `// TODO: read ${name}`;
  }
}

function printRustResult(t: ParamType): string {
  switch (t) {
    case "int[]":  case "float[]": case "string[]":
      return `let out: Vec<String> = result.iter().map(|x| x.to_string()).collect(); println!("{}", out.join(" "));`;
    case "bool":
      return `println!("{}", if result { "true" } else { "false" });`;
    default:
      return `println!("{}", result);`;
  }
}

export function generateRustPartial(s: ProblemStructure): string {
  const params = s.params.map(p => `${p.name}: ${rustType(p.type)}`).join(", ");
  return `fn ${s.functionName}(${params}) -> ${rustType(s.returnType)} {\n    // Your code here\n    todo!()\n}`;
}

export function generateRustFull(s: ProblemStructure): string {
  const reads = s.params.map(p => readRustParam(p.name, p.type)).join("\n    ");
  const callArgs = s.params.map(p => p.name).join(", ");
  const print = printRustResult(s.returnType);

  return `use std::io::{self, BufRead};

fn next_line() -> String {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    lines.next().unwrap().unwrap()
}

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

fn main() {
    ${reads}

    let result = ${s.functionName}(${callArgs});
    ${print}
}`;
}
