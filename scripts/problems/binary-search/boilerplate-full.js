const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let _idx = 0;
const nextLine = () => lines[_idx++];

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

const n_nums = parseInt(nextLine());
const nums = nextLine().split(" ").slice(0, n_nums).map(Number);
const target = parseInt(nextLine());

const result = search(nums, target);
console.log(result);