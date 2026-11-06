# T3 魔法药水 (potion) 题解

## 1. 题目分析

### 题目大意
- 有 $n$ 种材料，每种材料魔力值为 $a_i$。
- 选择若干种材料（假设选择了 $k$ 种材料， $1 \le k \le n$），选中的材料魔力值之和为 $S$。
- 在 $t$ 时刻，药水的魔力值为：
  $$V(t) = S + k \cdot t$$
- 问：是否存在一个非负整数时刻 $t \ge 0$，使得 $V(t) = m$？求出所有合法选择中，最小的非负整数 $t$。

### 数据范围
- $1 \le n \le 100$
- $1 \le a_i \le 10^7$
- $10^9 \le m \le 10^{18}$

---

## 2. 解题思路与模型转化

### 2.1 数学条件转化
对于选取的材料集合，假设其大小为 $k$，总初始魔力为 $S$。
需要满足：
$$S + k \cdot t = m \iff k \cdot t = m - S \iff t = \frac{m - S}{k}$$

因为时刻 $t$ 必须是非负整数：
1. $m - S \ge 0$，即 $S \le m$。
2. $m - S$ 必须能被 $k$ 整除，即：
   $$m \equiv S \pmod k$$
   或等价于：
   $$S \equiv m \pmod k$$

在所有满足以上条件的选择方案中，我们要最小化 $t = \frac{m - S}{k}$。
注意到当 $k$ 固定时，分母固定，要想让 $\frac{m - S}{k}$ 尽量小，**$S$ 必须尽量大**（即在不超过 $m$ 且 $S \equiv m \pmod k$ 的前提下最大化 $S$）。

### 2.2 动态规划建模
如果我们直接对所有可能的状态做背包，状态数过大。但题目中 $n \le 100$，选出的材料数量 $k$ 满足 $1 \le k \le n$。

我们可以**枚举选出的材料数量 $k$**（从 $1$ 到 $n$）：
- 目标：恰好选出 $k$ 个数，使得选出的数之和 $S \le m$，且 $S \equiv (m \bmod k) \pmod k$。
- 此时 $t = \frac{m - S}{k}$。为使 $t$ 最小，我们需要在满足同余条件的前提下，求出**可能的最大和 $S$**。

由于 $k \le 100$，所有元素关于模 $k$ 的余数只有 $k$ 种情况。
我们可以设计二维/三维背包 DP：
定义 $dp[c][r]$ 表示：当前选了 $c$ 个数，且元素和模 $k$ 的余数为 $r$ 时，所能得到的**最大和**。
- 转移方程（第 $i$ 个物品 $v = a_i$）：
  $$dp[c][(r + v) \bmod k] = \max\Big(dp[c][(r + v) \bmod k],\; dp[c - 1][r] + v\Big)$$
- 边界：$dp[0][0] = 0$，其余为 $-\infty$。
- 对于每个固定的 $k$，运行一次 0-1 背包 DP（容量为选取的物品个数 $k$），最终查看 $dp[k][m \bmod k]$ 的值。
- 若此值存在且 $\le m$，则可以用 $t = \frac{m - dp[k][m \bmod k]}{k}$ 来更新全局最小答案。

### 2.3 复杂度分析
- 外层枚举 $k$：$1 \le k \le n$，共 $n$ 次。
- 内层物品数 $n$，选取个数 $c \le k$，余数维度 $k$。
- 单次复杂度为 $O(n \cdot k^2)$。
- 总复杂度：
  $$\sum_{k=1}^n O(n \cdot k^2) \approx O\left(n \cdot \frac{n^3}{3}\right) = O\left(\frac{n^4}{3}\right)$$
  当 $n = 100$ 时，$100^4 / 3 \approx 3.3 \times 10^7$ 次基本运算，在 C++ 下可在 0.2 秒内轻松通过。

---

## 3. 参考代码与详细注释

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// 使用 long long 防止魔力值计算溢出
const long long INF = -1;

int main() {
    // 加速标准输入输出
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long m;
    if (!(cin >> n >> m)) return 0;

    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    // ans 初始化为一个极大值（2^62 左右）
    unsigned long long min_t = ~0ULL;
    bool found = false;

    // 枚举选择的材料种类总数 k
    for (int k = 1; k <= n; ++k) {
        // dp[c][r]: 恰好选了 c 个物品，元素和模 k 的余数为 r 时的最大和
        // 用 -1 表示不可达
        vector<vector<long long>> dp(k + 1, vector<long long>(k, -1));
        dp[0][0] = 0;

        // 0-1 背包过程：遍历每一个物品
        for (int i = 0; i < n; ++i) {
            long long v = a[i];
            int rem = v % k;

            // 倒序遍历选取的物品数量 c，保证每个物品仅被选取一次
            for (int c = k; c >= 1; --c) {
                for (int r = 0; r < k; ++r) {
                    if (dp[c - 1][r] != -1) {
                        int next_r = (r + rem) % k;
                        dp[c][next_r] = max(dp[c][next_r], dp[c - 1][r] + v);
                    }
                }
            }
        }

        // 目标余数
        int target_rem = m % k;
        long long max_sum = dp[k][target_rem];

        // 如果存在满足同余条件的方案，且最大和不超过目标 m
        if (max_sum != -1 && max_sum <= m) {
            unsigned long long cur_t = (m - max_sum) / k;
            if (!found || cur_t < min_t) {
                min_t = cur_t;
                found = true;
            }
        }
    }

    cout << min_t << "\n";

    return 0;
}
```