#include <bits/stdc++.h>
using namespace std;

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n_param1; cin >> n_param1;
    vector<int> param1(n_param1);
    for (auto &x : param1) cin >> x;
    int param2; cin >> param2;

    auto result = myFunctionName(param1, param2);
    cout << result;
    cout << endl;
    return 0;
}