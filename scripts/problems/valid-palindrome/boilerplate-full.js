const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let _idx = 0;
const nextLine = () => lines[_idx++];

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

const s = nextLine();

const result = isPalindrome(s);
console.log(result ? "true" : "false");