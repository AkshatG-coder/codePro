const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let _idx = 0;
const nextLine = () => lines[_idx++];

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

const n = parseInt(nextLine());

const result = fib(n);
console.log(result);