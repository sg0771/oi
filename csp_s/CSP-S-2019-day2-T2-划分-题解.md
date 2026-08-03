# P5665 [CSP-S 2019] 划分 题解

## 题目大意

将序列 $a_1, \ldots, a_n$ 划分为若干连续段，使各段和递增（非降），最小化各段和的平方和。

---

## 解题思路

### 贪心性质

**核心引理**：在段和递增的约束下，使平方和最小的最优策略是让每一段的和尽可能大。

直观理解：由 $(x-a)^2 + a^2 < x^2$（当 $a \le x/2$ 时），将一段拆成更小的段反而增大平方和。因此每段应贪心地取到约束允许的最大值。

### DP 定义

设 $S[i]$ 为前缀和，$f[i]$ 为最优划分下第 $i$ 个分段点（即最后一段的起点 $-1$），$g[i] = S[f[i]] + (S[i] - S[f[i]]) = S[i]$，实际维护的关键量为：

$$\text{val}[i] = S[f[i]] + (S[i] - S[f[i]]) = S[i]$$

更准确的定义：$\text{last}[i] = S[i] - S[f[i]]$（最后一段的和），约束为 $\text{last}[i] \ge \text{last}[f[i]]$，即 $S[i] - S[f[i]] \ge S[f[i]] - S[f[f[i]]]$。

化简得 $S[i] \ge 2 \cdot S[f[i]] - S[f[f[i]]]$，即 $S[f[i]] + \text{last}[f[i]] \le S[i]$。

### 单调队列优化

维护候选分段点 $j$，按 $S[j] + \text{last}[j]$ 单调递增排列。对每个 $i$，在队列中找最大的 $j$ 满足 $S[j] + \text{last}[j] \le S[i]$，即为 $f[i]$。

用单调指针（双指针）即可在 $\mathcal{O}(n)$ 内完成。

### 高精度输出

答案可达 $10^{36}$ 级别，需用 `__int128` 或手动高精度。

---

## C++ 源代码

```cpp
#include <iostream>
#include <vector>
using namespace std;

typedef unsigned long long u64;
typedef __int128 i128;

const int MAXN = 40000005;
int n, type;
u64 a[MAXN];
u64 S[MAXN];      // 前缀和
int f[MAXN];      // f[i] = 最优分段点
u64 lastSum[MAXN]; // lastSum[i] = 最后一段的和

// 输出 __int128
void print128(i128 x) {
    if (x == 0) { cout << 0; return; }
    string s;
    while (x > 0) { s += char('0' + x % 10); x /= 10; }
    reverse(s.begin(), s.end());
    cout << s;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> type;
    if (type == 0) {
        for (int i = 1; i <= n; ++i) cin >> a[i];
    } else {
        u64 x, y, z, b1, b2;
        int m;
        cin >> x >> y >> z >> b1 >> b2 >> m;
        vector<int> p(m + 1), l(m + 1), r(m + 1);
        for (int i = 1; i <= m; ++i) cin >> p[i] >> l[i] >> r[i];
        vector<u64> b(n + 1);
        b[1] = b1; b[2] = b2;
        for (int i = 3; i <= n; ++i)
            b[i] = (x * b[i-1] + y * b[i-2] + z) % (1ULL << 30);
        int idx = 1;
        for (int i = 1; i <= n; ++i) {
            while (idx <= m && p[idx] < i) idx++;
            a[i] = (b[i] % (u64)(r[idx] - l[idx] + 1)) + l[idx];
        }
    }

    for (int i = 1; i <= n; ++i) S[i] = S[i-1] + a[i];

    // 单调队列求最优分段点
    // q 中维护候选 j，按 S[j]+lastSum[j] 单调递增
    static int q[MAXN];
    int head = 0, tail = 0;
    q[tail++] = 0;  // j=0 作为起点
    f[0] = 0;
    lastSum[0] = 0;

    for (int i = 1; i <= n; ++i) {
        // 找最大的 j 使得 S[j] + lastSum[j] <= S[i]
        while (tail - head > 1 &&
               S[q[head + 1]] + lastSum[q[head + 1]] <= S[i]) {
            head++;
        }
        f[i] = q[head];
        lastSum[i] = S[i] - S[f[i]];
        // 维护单调性：弹出队尾不优的候选
        while (tail > head &&
               S[q[tail - 1]] + lastSum[q[tail - 1]] >= S[i] + lastSum[i]) {
            tail--;
        }
        q[tail++] = i;
    }

    // 计算答案：各段和的平方和
    i128 ans = 0;
    int cur = n;
    while (cur > 0) {
        u64 segSum = S[cur] - S[f[cur]];
        ans += (i128)segSum * segSum;
        cur = f[cur];
    }

    print128(ans);
    cout << "\n";

    return 0;
}
```

---

## 复杂度分析

- **时间复杂度**：$\mathcal{O}(n)$，单调队列每个元素至多入队出队一次。
- **空间复杂度**：$\mathcal{O}(n)$，前缀和与队列均为线性。

---

## 关键点

1. **贪心正确性**：段和递增约束下，每段尽可能大可最小化平方和，可通过交换论证证明。
2. **单调队列**：维护 $S[j] + \text{last}[j]$ 单调递增的候选集，双指针扫描实现 $\mathcal{O}(n)$。
3. **高精度**：$n = 4 \times 10^7$，$a_i \le 10^9$，答案可达 $10^{36}$，必须用 `__int128`。
4. **数据生成**：`type=1` 时按公式生成 $a_i$，不影响算法本身。
