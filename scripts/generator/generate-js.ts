import type { ProblemStructure, ParamType } from "./parse-structure";

function jsType(t: ParamType): string {
  switch (t) {
    case "int":    case "float":  return "number";
    case "int[]":  case "float[]":return "number[]";
    case "int[][]":               return "number[][]";
    case "string":                return "string";
    case "string[]":              return "string[]";
    case "bool":                  return "boolean";
    case "bool[]":                return "boolean[]";
    default:                      return "any";
  }
}

function readJsParam(name: string, t: ParamType, lineVar: string): string {
  switch (t) {
    case "int":    return `const ${name} = parseInt(${lineVar}());`;
    case "float":  return `const ${name} = parseFloat(${lineVar}());`;
    case "string": return `const ${name} = ${lineVar}();`;
    case "bool":   return `const ${name} = ${lineVar}() === "true";`;
    case "int[]":  return `const n_${name} = parseInt(${lineVar}());\nconst ${name} = ${lineVar}().split(" ").slice(0, n_${name}).map(Number);`;
    case "float[]":return `const n_${name} = parseInt(${lineVar}());\nconst ${name} = ${lineVar}().split(" ").slice(0, n_${name}).map(parseFloat);`;
    case "string[]":return `const n_${name} = parseInt(${lineVar}());\nconst ${name} = ${lineVar}().split(" ").slice(0, n_${name});`;
    case "int[][]":return `const [r_${name}, c_${name}] = ${lineVar}().split(" ").map(Number);\nconst ${name} = Array.from({length: r_${name}}, () => ${lineVar}().split(" ").slice(0, c_${name}).map(Number));`;
    default:       return `const ${name} = ${lineVar}();`;
  }
}

function printJsResult(t: ParamType): string {
  switch (t) {
    case "int[]":  case "float[]": case "string[]": case "bool[]":
      return `console.log(result.join(" "));`;
    case "int[][]":
      return `result.forEach(row => console.log(row.join(" ")));`;
    case "bool":
      return `console.log(result ? "true" : "false");`;
    default:
      return `console.log(result);`;
  }
}

export function generateJsPartial(s: ProblemStructure): string {
  const params = s.params.map(p => `${p.name}`).join(", ");
  return `/**\n${s.params.map(p => ` * @param {${jsType(p.type)}} ${p.name}`).join("\n")}\n * @return {${jsType(s.returnType)}}\n */\nfunction ${s.functionName}(${params}) {\n    // Your code here\n}`;
}

export function generateJsFull(s: ProblemStructure): string {
  const reads = s.params.map(p => readJsParam(p.name, p.type, "nextLine")).join("\n");
  const callArgs = s.params.map(p => p.name).join(", ");
  const print = printJsResult(s.returnType);

  return `const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");
let _idx = 0;
const nextLine = () => lines[_idx++];

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

${reads}

const result = ${s.functionName}(${callArgs});
${print}`;
}
