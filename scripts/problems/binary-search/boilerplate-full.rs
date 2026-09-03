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
    let _n_nums: usize = next_line().trim().parse().unwrap();
let nums: Vec<i64> = next_line().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let target: i64 = next_line().trim().parse().unwrap();

    let result = search(nums, target);
    println!("{}", result);
}