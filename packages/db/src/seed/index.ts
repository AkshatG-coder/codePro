import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "../index";

const LANG = { cpp: 54, js: 63, rust: 73 } as const;

async function seed() {
  console.log("🌱 Seeding database from scripts/problems/...\n");

  const problemsDir = path.join(process.cwd(), "..", "..", "scripts", "problems");
  let entries;
  try {
    entries = await fs.readdir(problemsDir, { withFileTypes: true });
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log("❌ No scripts/problems directory found. Run the generator first.");
      return;
    }
    throw err;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const slug = entry.name;
    const dir = path.join(problemsDir, slug);

    try {
      const metadataStr = await fs.readFile(path.join(dir, "metadata.json"), "utf8");
      const metadata = JSON.parse(metadataStr);
      
      const description = await fs.readFile(path.join(dir, "problem.md"), "utf8");
      
      const testcasesStr = await fs.readFile(path.join(dir, "testcases.json"), "utf8");
      const testCases = JSON.parse(testcasesStr);

      const defaultCpp = await fs.readFile(path.join(dir, "default-code.cpp"), "utf8");
      const defaultJs = await fs.readFile(path.join(dir, "default-code.js"), "utf8");
      const defaultRs = await fs.readFile(path.join(dir, "default-code.rs"), "utf8");

      const fullCpp = await fs.readFile(path.join(dir, "boilerplate-full.cpp"), "utf8");
      const fullJs = await fs.readFile(path.join(dir, "boilerplate-full.js"), "utf8");
      const fullRs = await fs.readFile(path.join(dir, "boilerplate-full.rs"), "utf8");

      // Upsert the problem
      const prob = await prisma.problem.upsert({
        where: { slug: slug },
        update: {
          title:       metadata.title,
          description: description,
          difficulty:  metadata.difficulty,
          tags:        metadata.tags,
        },
        create: {
          slug:        slug,
          title:       metadata.title,
          description: description,
          difficulty:  metadata.difficulty,
          tags:        metadata.tags,
        },
      });

      // Recreate child records
      await prisma.testCase.deleteMany({ where: { problemId: prob.id } });
      await prisma.defaultCode.deleteMany({ where: { problemId: prob.id } });
      await prisma.fullBoilerplate.deleteMany({ where: { problemId: prob.id } });

      await prisma.defaultCode.createMany({
        data: [
          { problemId: prob.id, languageId: LANG.cpp, code: defaultCpp },
          { problemId: prob.id, languageId: LANG.js, code: defaultJs },
          { problemId: prob.id, languageId: LANG.rust, code: defaultRs },
        ]
      });

      await prisma.fullBoilerplate.createMany({
        data: [
          { problemId: prob.id, languageId: LANG.cpp, code: fullCpp },
          { problemId: prob.id, languageId: LANG.js, code: fullJs },
          { problemId: prob.id, languageId: LANG.rust, code: fullRs },
        ]
      });

      await prisma.testCase.createMany({
        data: testCases.map((tc: any) => ({
          problemId: prob.id,
          input: tc.input,
          expectedOutput: tc.expected,
          isHidden: tc.hidden ?? false,
        }))
      });

      console.log(`  ✅ Inserted/Updated ${slug}`);
    } catch (err: any) {
      console.error(`  ❌ Failed to process ${slug}: ${err.message}`);
    }
  }

  // Sample live contest
  const now = new Date();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h from now

  const existing = await prisma.contest.findFirst({ where: { title: "CodePro Starter Contest #1" } });
  if (!existing) {
    const probs = await prisma.problem.findMany({
      where: { slug: { in: ["two-sum", "binary-search", "maximum-subarray"] } },
      select: { id: true, slug: true },
    });
    
    if (probs.length > 0) {
      await prisma.contest.create({
        data: {
          title:       "CodePro Starter Contest #1",
          description: "A beginner-friendly contest. Solve 3 problems in 2 hours!",
          startTime:   now,
          endTime,
          contestProblems: {
            create: probs.map((prob, i) => ({
              problemId: prob.id,
              points:    [100, 200, 300][i],
              order:     i,
            })),
          },
        },
      });
      console.log("\n  🏆 Contest created!");
    }
  }

  console.log("\n✨ Done!");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
