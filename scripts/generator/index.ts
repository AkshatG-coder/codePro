import * as fs from "fs/promises";
import * as path from "path";
import * as readline from "readline";
import { parseStructure } from "./parse-structure";
import { generateCppPartial, generateCppFull } from "./generate-cpp";
import { generateJsPartial, generateJsFull } from "./generate-js";
import { generateRustPartial, generateRustFull } from "./generate-rust";

const PROBLEMS_DIR = path.join(process.cwd(), "scripts", "problems");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

async function createProblem() {
  const slug = await question("Enter problem slug (e.g., contains-duplicate): ");
  if (!slug.trim()) {
    console.log("Error: Slug cannot be empty.");
    return;
  }

  const problemDir = path.join(PROBLEMS_DIR, slug);
  try {
    await fs.mkdir(problemDir, { recursive: true });
  } catch (e) {
    console.error(`Failed to create directory: ${problemDir}`, e);
    return;
  }

  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const problemMd = `# ${title}

Write your problem description here.

## Examples

\`\`\`
Input:
Output:
\`\`\`

## Constraints
- 
`;

  const structureMd = `# function: myFunctionName
## params
- param1: int[]
- param2: int
## return
- int
`;

  const metadataJson = {
    title: title,
    difficulty: "EASY",
    tags: ["Array", "Math"]
  };

  const testcasesJson = [
    {
      input: "3 1 2 3\n1",
      expected: "0",
      hidden: false
    }
  ];

  await fs.writeFile(path.join(problemDir, "problem.md"), problemMd);
  await fs.writeFile(path.join(problemDir, "structure.md"), structureMd);
  await fs.writeFile(path.join(problemDir, "metadata.json"), JSON.stringify(metadataJson, null, 2));
  await fs.writeFile(path.join(problemDir, "testcases.json"), JSON.stringify(testcasesJson, null, 2));

  console.log(`\nCreated problem boilerplate in scripts/problems/${slug}`);
  console.log(`Please edit problem.md and structure.md, then run 'npm run generate' again and select 'Compile'.\n`);
}

async function compileProblems() {
  console.log(`\nScanning ${PROBLEMS_DIR}...`);
  try {
    const entries = await fs.readdir(PROBLEMS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const problemDir = path.join(PROBLEMS_DIR, entry.name);
        const structurePath = path.join(problemDir, "structure.md");
        
        try {
          const content = await fs.readFile(structurePath, "utf-8");
          console.log(`Compiling: ${entry.name}`);
          const struct = parseStructure(content);

          await fs.writeFile(path.join(problemDir, "boilerplate-full.cpp"), generateCppFull(struct));
          await fs.writeFile(path.join(problemDir, "default-code.cpp"), generateCppPartial(struct));

          await fs.writeFile(path.join(problemDir, "boilerplate-full.js"), generateJsFull(struct));
          await fs.writeFile(path.join(problemDir, "default-code.js"), generateJsPartial(struct));

          await fs.writeFile(path.join(problemDir, "boilerplate-full.rs"), generateRustFull(struct));
          await fs.writeFile(path.join(problemDir, "default-code.rs"), generateRustPartial(struct));

        } catch (err: any) {
          if (err.code === "ENOENT") {
            console.log(`Skipping ${entry.name}: No structure.md found.`);
          } else {
            console.error(`Error parsing ${entry.name}:`, err.message);
          }
        }
      }
    }
    console.log("\nCompilation complete!\n");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log(`No problems directory found at ${PROBLEMS_DIR}.`);
    } else {
      console.error(`Error reading directory:`, err);
    }
  }
}

async function main() {
  console.log("=========================================");
  console.log("CodePro Problem Generator");
  console.log("=========================================\n");
  console.log("1. Scaffold a new problem");
  console.log("2. Compile boilerplates from structure.md");
  console.log("3. Exit\n");

  const choice = await question("Select an option (1-3): ");

  if (choice === "1") {
    await createProblem();
  } else if (choice === "2") {
    await compileProblems();
  } else {
    console.log("Goodbye!");
  }

  rl.close();
}

main().catch(console.error);
