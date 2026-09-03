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
    let s: String = next_line().trim().to_string();

    let result = isPalindrome(s);
    println!("{}", if result { "true" } else { "false" });
}