use std::io::{self, BufRead};

fn next_line() -> String {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    lines.next().unwrap().unwrap()
}

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

fn main() {
    let n: i64 = next_line().trim().parse().unwrap();

    let result = fib(n);
    println!("{}", result);
}