#include <bits/stdc++.h>
using namespace std;

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n_nums; cin >> n_nums;
    vector<int> nums(n_nums);
    for (auto &x : nums) cin >> x;
    int target; cin >> target;

    auto result = twoSum(nums, target);
    for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "");
    cout << endl;
    return 0;
}