#include <bits/stdc++.h>
using namespace std;

// ── USER CODE START ──
{{USER_CODE}}
// ── USER CODE END ──

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s; cin >> s;

    auto result = isPalindrome(s);
    cout << (result ? "true" : "false");
    cout << endl;
    return 0;
}