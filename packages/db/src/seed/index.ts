import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LANG = { cpp: 54, js: 63, rust: 73 } as const;

// ── Self-contained boilerplates ─────────────────────────────────────

const PROBLEMS = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "EASY" as const,
    tags: ["Arrays", "HashMap"],
    description: `# Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to target.\n\n## Examples\n\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\`\`\`\n\n## Constraints\n- 2 ≤ nums.length ≤ 10⁴\n- Only one valid answer exists.`,
    defaultCodes: {
      [LANG.cpp]: `vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}`,
      [LANG.js]: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your code here\n}`,
      [LANG.rust]: `fn two_sum(nums: Vec<i64>, target: i64) -> Vec<i64> {\n    // Your code here\n    todo!()\n}`,
    },
    fullBoilerplates: {
      [LANG.cpp]: `#include <bits/stdc++.h>\nusing namespace std;\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nint main() {\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (auto& x : nums) cin >> x;\n    int target; cin >> target;\n    auto result = twoSum(nums, target);\n    for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i+1<result.size()?" ":"");\n    cout << endl;\n}`,
      [LANG.js]: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nlet _i=0; const nl=()=>lines[_i++];\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nconst n=parseInt(nl()); const nums=nl().split(' ').map(Number);\nconst target=parseInt(nl());\nconsole.log(twoSum(nums,target).join(' '));`,
      [LANG.rust]: `use std::io::{self,Read};\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nfn main(){\nlet mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();\nlet mut it=s.split_whitespace();\nlet n:usize=it.next().unwrap().parse().unwrap();\nlet nums:Vec<i64>=(0..n).map(|_|it.next().unwrap().parse().unwrap()).collect();\nlet t:i64=it.next().unwrap().parse().unwrap();\nlet r=two_sum(nums,t);\nprintln!("{} {}",r[0],r[1]);\n}`,
    },
    testCases: [
      { input: "4\n2 7 11 15\n9", expected: "0 1" },
      { input: "3\n3 2 4\n6",     expected: "1 2" },
      { input: "2\n3 3\n6",       expected: "0 1" },
      { input: "5\n1 2 3 4 5\n9", expected: "3 4", hidden: true },
    ],
  },
  {
    slug: "fibonacci",
    title: "Nth Fibonacci Number",
    difficulty: "EASY" as const,
    tags: ["Math", "DP"],
    description: `# Nth Fibonacci Number\n\nGiven an integer \`n\`, return the **nth Fibonacci number**.\n\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).\n\n## Examples\n\n\`\`\`\nInput: 6\nOutput: 8\n\`\`\`\n\n## Constraints\n- 0 ≤ n ≤ 30`,
    defaultCodes: {
      [LANG.cpp]: `int fib(int n) {\n    // Your code here\n}`,
      [LANG.js]: `/**\n * @param {number} n\n * @return {number}\n */\nfunction fib(n) {\n    // Your code here\n}`,
      [LANG.rust]: `fn fib(n: i64) -> i64 {\n    // Your code here\n    todo!()\n}`,
    },
    fullBoilerplates: {
      [LANG.cpp]: `#include <bits/stdc++.h>\nusing namespace std;\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nint main(){\n    int n; cin>>n;\n    cout<<fib(n)<<endl;\n}`,
      [LANG.js]: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nconsole.log(fib(parseInt(lines[0])));`,
      [LANG.rust]: `use std::io::{self,Read};\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nfn main(){\nlet mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();\nlet n:i64=s.trim().parse().unwrap();\nprintln!("{}",fib(n));\n}`,
    },
    testCases: [
      { input: "0",  expected: "0" },
      { input: "1",  expected: "1" },
      { input: "6",  expected: "8" },
      { input: "10", expected: "55", hidden: true },
    ],
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "MEDIUM" as const,
    tags: ["Arrays", "DP", "Greedy"],
    description: `# Maximum Subarray\n\nGiven an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.\n\n## Examples\n\n\`\`\`\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\n\`\`\`\n\n## Constraints\n- 1 ≤ nums.length ≤ 10⁵`,
    defaultCodes: {
      [LANG.cpp]: `int maxSubArray(vector<int>& nums) {\n    // Your code here\n}`,
      [LANG.js]: `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n    // Your code here\n}`,
      [LANG.rust]: `fn max_sub_array(nums: Vec<i64>) -> i64 {\n    // Your code here\n    todo!()\n}`,
    },
    fullBoilerplates: {
      [LANG.cpp]: `#include <bits/stdc++.h>\nusing namespace std;\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nint main(){\n    int n; cin>>n;\n    vector<int> nums(n); for(auto& x:nums) cin>>x;\n    cout<<maxSubArray(nums)<<endl;\n}`,
      [LANG.js]: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nlet _i=0;const nl=()=>lines[_i++];\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nconst n=parseInt(nl());\nconst nums=nl().split(' ').map(Number);\nconsole.log(maxSubArray(nums));`,
      [LANG.rust]: `use std::io::{self,Read};\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nfn main(){\nlet mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();\nlet mut it=s.split_whitespace();\nlet n:usize=it.next().unwrap().parse().unwrap();\nlet nums:Vec<i64>=(0..n).map(|_|it.next().unwrap().parse().unwrap()).collect();\nprintln!("{}",max_sub_array(nums));\n}`,
    },
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected: "6"  },
      { input: "1\n1",                       expected: "1"  },
      { input: "5\n5 4 -1 7 8",              expected: "23" },
      { input: "4\n-3 -2 -1 -4",             expected: "-1", hidden: true },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "EASY" as const,
    tags: ["Binary Search", "Arrays"],
    description: `# Binary Search\n\nGiven a **sorted** array of integers \`nums\` and a \`target\`, return the index if found, else \`-1\`.\n\nMust run in **O(log n)**.\n\n## Examples\n\n\`\`\`\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n\`\`\``,
    defaultCodes: {
      [LANG.cpp]: `int search(vector<int>& nums, int target) {\n    // Your code here\n}`,
      [LANG.js]: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n    // Your code here\n}`,
      [LANG.rust]: `fn search(nums: Vec<i64>, target: i64) -> i64 {\n    // Your code here\n    todo!()\n}`,
    },
    fullBoilerplates: {
      [LANG.cpp]: `#include <bits/stdc++.h>\nusing namespace std;\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nint main(){\n    int n; cin>>n;\n    vector<int> nums(n); for(auto& x:nums) cin>>x;\n    int target; cin>>target;\n    cout<<search(nums,target)<<endl;\n}`,
      [LANG.js]: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nlet _i=0;const nl=()=>lines[_i++];\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nconst n=parseInt(nl());\nconst nums=nl().split(' ').map(Number);\nconst target=parseInt(nl());\nconsole.log(search(nums,target));`,
      [LANG.rust]: `use std::io::{self,Read};\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nfn main(){\nlet mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();\nlet mut it=s.split_whitespace();\nlet n:usize=it.next().unwrap().parse().unwrap();\nlet nums:Vec<i64>=(0..n).map(|_|it.next().unwrap().parse().unwrap()).collect();\nlet t:i64=it.next().unwrap().parse().unwrap();\nprintln!("{}",search(nums,t));\n}`,
    },
    testCases: [
      { input: "6\n-1 0 3 5 9 12\n9",  expected: "4"  },
      { input: "6\n-1 0 3 5 9 12\n2",  expected: "-1" },
      { input: "1\n5\n5",               expected: "0"  },
      { input: "4\n1 2 3 4\n3",         expected: "2", hidden: true },
    ],
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "EASY" as const,
    tags: ["Strings", "Two Pointers"],
    description: `# Valid Palindrome\n\nA phrase is a palindrome if, after removing non-alphanumeric characters and lowercasing, it reads the same forward and backward.\n\n## Examples\n\n\`\`\`\nInput: "A man a plan a canal Panama"\nOutput: true\n\`\`\``,
    defaultCodes: {
      [LANG.cpp]: `bool isPalindrome(string s) {\n    // Your code here\n}`,
      [LANG.js]: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isPalindrome(s) {\n    // Your code here\n}`,
      [LANG.rust]: `fn is_palindrome(s: String) -> bool {\n    // Your code here\n    todo!()\n}`,
    },
    fullBoilerplates: {
      [LANG.cpp]: `#include <bits/stdc++.h>\nusing namespace std;\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nint main(){\n    string s; getline(cin,s);\n    cout<<(isPalindrome(s)?"true":"false")<<endl;\n}`,
      [LANG.js]: `const s=require('fs').readFileSync('/dev/stdin','utf8').trim();\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nconsole.log(isPalindrome(s)?"true":"false");`,
      [LANG.rust]: `use std::io::{self,Read};\n// ── USER CODE START ──\n{{USER_CODE}}\n// ── USER CODE END ──\nfn main(){\nlet mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();\nprintln!("{}",if is_palindrome(s.trim().to_string()){"true"}else{"false"});\n}`,
    },
    testCases: [
      { input: "A man a plan a canal Panama", expected: "true"  },
      { input: "race a car",                  expected: "false" },
      { input: " ",                            expected: "true"  },
      { input: "Was it a car or a cat I saw", expected: "true", hidden: true },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  for (const p of PROBLEMS) {
    const langEntries = Object.entries(p.defaultCodes) as [string, string][];
    const fullEntries = Object.entries(p.fullBoilerplates) as [string, string][];

    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug:        p.slug,
        title:       p.title,
        description: p.description,
        difficulty:  p.difficulty,
        tags:        p.tags,
        defaultCodes: {
          create: langEntries.map(([langId, code]) => ({
            languageId: parseInt(langId),
            code,
          })),
        },
        fullBoilerplates: {
          create: fullEntries.map(([langId, code]) => ({
            languageId: parseInt(langId),
            code,
          })),
        },
        testCases: {
          create: p.testCases.map((tc) => ({
            input:          tc.input,
            expectedOutput: tc.expected,
            isHidden:       tc.hidden ?? false,
          })),
        },
      },
    });
    console.log(`  ✅ ${p.title}`);
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

  console.log("\n✨ Done!");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
