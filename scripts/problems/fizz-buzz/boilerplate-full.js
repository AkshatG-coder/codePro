const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let _idx = 0;
const nextLine = () => lines[_idx++];

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

const n_param1 = parseInt(nextLine());
const param1 = nextLine().split(" ").slice(0, n_param1).map(Number);
const param2 = parseInt(nextLine());

const result = myFunctionName(param1, param2);
console.log(result);