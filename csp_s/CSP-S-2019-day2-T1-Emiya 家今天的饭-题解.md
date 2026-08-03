# P5664 [CSP-S 2019] Emiya 家今天的饭 题解

## 题目大意

$n$ 种烹饪方法，$m$ 种食材，$a_{i,j}$ 道使用方法 $i$ 和食材 $j$ 的菜。选一组菜满足：至少一道、每道菜烹饪方法不同、每种食材至多出现在一半的菜中。求方案数模 $998244353$。

---

## 解题思路

### 总方案数

忽略食材限制，每种方法 $i$ 可选 0 道菜或选 1 道（某种食材 $j$ 的 $a_{i,j}$ 道之一），共 $1 + \sum_j a_{i,j}$ 种选择。总方案数（含空集）为：

$$\text{total} = \prod_{i=1}^{n} \left(1 + \sum_{j=1}^{m} a_{i,j}\right) - 1$$

### 容斥去不合法

**关键观察**：若某食材出现在超过一半的菜中，则不可能有两个食材同时违反（因为两者之和超过总菜数）。因此不合法方案之间无交集，直接对每种食材求不合法数并求和。

### 对固定食材 $j$ 的 DP

设 $s_i = \sum_j a_{i,j}$（方法 $i$ 的总菜数），$b_i = a_{i,j}$（方法 $i$ 用食材 $j$ 的菜数），$c_i = s_i - b_i$（方法 $i$ 不用食材 $j$ 的菜数）。

定义 $f_i[\Delta]$ 表示前 $i$ 种方法中，**选了食材 $j$ 的菜数减去没选食材 $j$ 的菜数**为 $\Delta$ 的方案数。转移：

- 不选方法 $i$：$f_i[\Delta] \mathrel{+}= f_{i-1}[\Delta]$
- 选食材 $j$：$f_i[\Delta+1] \mathrel{+}= f_{i-1}[\Delta] \times b_i$
- 选其他食材：$f_i[\Delta-1] \mathrel{+}= f_{i-1}[\Delta] \times c_i$

食材 $j$ 出现超过一半 $\Leftrightarrow$ $\Delta > 0$。不合法数为 $\sum_{\Delta > 0} f_n[\Delta]$。

$\Delta$ 范围 $[-n, n]$，用偏移量处理。每种食材 DP 为 $\mathcal{O}(n^2)$，共 $m$ 种食材。

### 答案

$$\text{ans} = \text{total} - \sum_{j=1}^{m} \text{bad}_j \pmod{998244353}$$

---

## C++ 源代码

```cpp
#include <iostream>
using namespace std;

const int MOD = 998244353;
const int MAXN = 105, MAXM = 2005;

int n, m;
long long a[MAXN][MAXM];
long long s[MAXN];  // s[i] = sum of a[i][j]
long long dp[MAXN << 1];  // dp[delta + offset]

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    for (int i = 1; i <= n; ++i) {
        s[i] = 0;
        for (int j = 1; j <= m; ++j) {
            cin >> a[i][j];
            s[i] = (s[i] + a[i][j]) % MOD;
        }
    }

    // 总方案数（含空集）
    long long total = 1;
    for (int i = 1; i <= n; ++i) {
        total = total * (1 + s[i]) % MOD;
    }
    total = (total - 1 + MOD) % MOD;  // 减去空集

    // 对每种食材求不合法数
    long long bad = 0;
    for (int j = 1; j <= m; ++j) {
        // 重置 dp
        int offset = n;
        for (int k = 0; k <= 2 * n; ++k) dp[k] = 0;
        dp[offset] = 1;  // delta = 0

        for (int i = 1; i <= n; ++i) {
            long long b = a[i][j];         // 选食材 j
            long long c = (s[i] - b % MOD + MOD) % MOD;  // 选其他食材
            // 倒序遍历避免覆盖
            for (int d = 2 * n; d >= 0; --d) {
                long long val = dp[d];
                dp[d] = 0;
                if (val == 0) continue;
                // 不选方法 i
                dp[d] = (dp[d] + val) % MOD;
                // 选食材 j: delta + 1
                if (d + 1 <= 2 * n)
                    dp[d + 1] = (dp[d + 1] + val * b) % MOD;
                // 选其他食材: delta - 1
                if (d - 1 >= 0)
                    dp[d - 1] = (dp[d - 1] + val * c) % MOD;
            }
        }

        // 不合法: delta > 0，即 dp[k] for k > offset
        for (int d = offset + 1; d <= 2 * n; ++d) {
            bad = (bad + dp[d]) % MOD;
        }
    }

    long long ans = (total - bad % MOD + MOD) % MOD;
    cout << ans << "\n";

    return 0;
}
```

---

## 复杂度分析

- **时间复杂度**：$\mathcal{O}(n^2 \cdot m)$，每种食材做 $\mathcal{O}(n^2)$ 的 DP。
- **空间复杂度**：$\mathcal{O}(n + nm)$，DP 数组 $\mathcal{O}(n)$，存储输入 $\mathcal{O}(nm)$。

---

## 关键点

1. **不重叠性**：至多一种食材能违反"不超过一半"约束，因此容斥无需交叉项，直接求和。
2. **差值 DP**：用 $\Delta = \text{选}j\text{的数} - \text{不选}j\text{的数}$ 将"超过一半"转化为 $\Delta > 0$，避免同时记录两个变量。
3. **模运算**：$c_i = s_i - a_{i,j}$ 需取模处理负数。
