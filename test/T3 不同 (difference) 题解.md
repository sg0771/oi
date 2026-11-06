# T3 不同 (difference) 题解

## 1. 题目分析

### 题意简述
给定序列长度 $n$ 和颜色数 $k$。序列 $a$ 满足 $a_i \in [1, k]$，且 $1 \sim k$ 均在 $a$ 中至少出现了一次。
根据序列 $a$ 定义序列 $b$：
$$ b_i = \min_{j \in [1, n], a_j \ne a_i} |i - j| $$
即每个位置 $i$ 到最近的异色数字的距离。求可以计算出的**不同的序列 $b$ 的数量**，结果对 $998244353$ 取模。

### 数据范围
- $1 \le n \le 2 \times 10^5$
- $2 \le k \le \min(n, 10)$（**关键突破口：$k \le 10$ 非常小**）

---

## 2. 深入剖析与数学转化

### 2.1 极长同色连通段与序列 $b$ 的形态
将 $a$ 划分为 $m$ 个极长连续同色段，每段长度为 $L_1, L_2, \dots, L_m$。因为相邻段颜色必不相同，对任意位置 $i$，最近的异色位置必然是其所在段边界外相邻的第 1 个点：
1. **左边界段**（第 1 段，长 $L_1$）：左边无异色，距离右侧异色位置单调递减，值为 $L_1, L_1-1, \dots, 2, 1$。
2. **右边界段**（第 $m$ 段，长 $L_m$）：右边无异色，距离左侧异色位置单调递增，值为 $1, 2, \dots, L_m$。
3. **中间段**（长 $L$）：两端受邻近异色约束，形如两端为 $1$ 向中心递增的对称峰：
   - 若 $L = 1$，值为 $[1]$；
   - 若 $L = 2$，值为 $[1, 1]$；
   - 若 $L \ge 3$，两端为 $1$，中间形成 $\ge 2$ 的唯一确定形态金字塔（长度为 $L-2$）。

### 2.2 极大 $\ge 2$ 连通块（内芯）的唯一性
可以发现，**每一个在 $b$ 序列中连续大于等于 2 的极大段（称为“内芯”）由其长度唯一决定其数字形态**！
在确定了所有的内芯后，其余所有位置的值必须全为 $1$。因此：
**合法的序列 $b$ 与不重叠的“内芯组件放置方案”存在严格的一一对应关系**！

每个内芯组件在序列中占用的区间及其对总块数的消耗（代价）：
- **中间内芯**：内芯长度 $len \ge 1$，外加两端的 2 个保护位 $1$，占用长度 $len + 2$，使原序列最大可拆分块数减少（代价）$c = len + 1 \ge 2$。
- **开头内芯**（若有）：内芯长度 $len \ge 1$，占用最左侧，外加右侧 1 个保护位 $1$，占用长度 $len + 1$，代价 $c = len \ge 1$。
- **结尾内芯**（若有）：占用最右侧，占用长度 $len + 1$，代价 $c = len \ge 1$。
- **空闲位置**：每个单点 $1$ 占用长度 $1$，代价为 $0$。

令人震撼的数学规律：**无论哪种组件，占用长度恒等于 $\text{代价 } c + 1$**！

### 2.3 颜色数 $k$ 的约束
要使得能使用全部 $k$ 种颜色，当且仅当最大可能划分的块数 $m_{\max} \ge k$。
由总长度与代价的关系可得，总代价 $C$ 必须满足：
$$ C \le n - k $$

### 2.4 四类放置情况与生成函数推导
根据两端是否存在内芯，分为 4 种情况。结合 Vandermonde 卷积恒等式：
$$ \sum_{C} \binom{C - A}{B} \binom{N - C}{m} = \binom{N - A + 1}{B + m + 1} $$
我们在不设 $C \le n-k$ 限制（即全集）时，可以将求和化简为极为简洁的封闭形式：
1. **无头无尾**：全集求和为 $\sum_{m} \binom{n - 2m}{2m}$；
2. **仅有头（或仅有尾）**：全集求和各为 $\sum_{m} \binom{n - 2m - 1}{2m + 1}$；
3. **既有头又有尾**：全集求和为 $\sum_{m} \binom{n - 2m - 2}{2m + 2}$。

### 2.5 容斥减去不合法项
题目要求 $C \le n - k$。因为 $k \le 10$，所以超出限制的代价仅有：
$$ C \in [n - k + 1, n] $$
只有最多 $k - 1 \le 9$ 个不合法的 $C$ 值！对于这几个常数级别的 $C$，我们直接枚举 $m$ 暴力算组合数累加扣除即可！

---

## 3. 复杂度分析

- **时间复杂度**：预处理阶乘及逆元 $\mathcal{O}(n)$；计算全集组合数求和只需枚举 $m \le n/2$，耗时 $\mathcal{O}(n)$；扣除不合法项只需枚举至多 9 个 $C$ 值，耗时 $9 \times \mathcal{O}(n)$。总耗时不到 $0.05\text{s}$。
- **空间复杂度**：存储阶乘与逆元数组，空间复杂度为 $\mathcal{O}(n)$。

---

## 4. 完整代码（附详细注释）

```cpp
#include <iostream>
#include <vector>

using namespace std;

const int MOD = 998244353;
const int MAXN = 400005;

long long fact[MAXN], invFact[MAXN];

// 快速幂
long long qpow(long long a, long long b) {
    long long res = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) res = (res * a) % MOD;
        a = (a * a) % MOD;
        b >>= 1;
    }
    return res;
}

// 组合数 C(n, m)
long long C(int n, int m) {
    if (m < 0 || m > n || n < 0) return 0;
    return fact[n] * invFact[m] % MOD * invFact[n - m] % MOD;
}

// 预处理阶乘及其逆元
void init(int n) {
    fact[0] = 1;
    invFact[0] = 1;
    for (int i = 1; i <= n; ++i) {
        fact[i] = (fact[i - 1] * i) % MOD;
    }
    invFact[n] = qpow(fact[n], MOD - 2);
    for (int i = n - 1; i >= 1; --i) {
        invFact[i] = (invFact[i + 1] * (i + 1)) % MOD;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    init(2 * n + 5);

    // 1. 计算无上界限制时的全集总方案数
    long long total = 0;

    // 情况 1: 无左无右，闭式为 sum C(n - 2m, 2m)
    for (int m = 0; 2 * m <= n; ++m) {
        total = (total + C(n - 2 * m, 2 * m)) % MOD;
    }

    // 情况 2 & 3: 仅左有 或 仅右有 (对称，乘 2)，闭式为 sum C(n - 2m - 1, 2m + 1)
    long long single_side = 0;
    for (int m = 0; 2 * m + 1 <= n; ++m) {
        single_side = (single_side + C(n - 2 * m - 1, 2 * m + 1)) % MOD;
    }
    total = (total + 2 * single_side) % MOD;

    // 情况 4: 左右皆有，闭式为 sum C(n - 2m - 2, 2m + 2)
    for (int m = 0; 2 * m + 2 <= n; ++m) {
        total = (total + C(n - 2 * m - 2, 2 * m + 2)) % MOD;
    }

    // 2. 减去 C > n - k 的不合法方案（C 从 n - k + 1 到 n，至多 9 项）
    long long invalid = 0;
    for (int cost = n - k + 1; cost <= n; ++cost) {
        // 枚举中间块个数 m
        for (int m = 0; 2 * m <= cost; ++m) {
            // 情况 1: 无左无右 (要求 cost >= 2m)
            if (m == 0) {
                if (cost == 0) invalid = (invalid + C(n - cost, 0)) % MOD;
            } else {
                long long ways = C(cost - m - 1, m - 1) * C(n - cost, m) % MOD;
                invalid = (invalid + ways) % MOD;
            }

            // 情况 2 & 3: 仅左有 或 仅右有 (要求 cost >= 2m + 1)
            if (cost >= 2 * m + 1) {
                long long ways = C(cost - m - 1, m) * C(n - cost - 1, m) % MOD;
                invalid = (invalid + 2 * ways) % MOD;
            }

            // 情况 4: 左右皆有 (要求 cost >= 2m + 2)
            if (cost >= 2 * m + 2) {
                long long ways = C(cost - m - 1, m + 1) * C(n - cost - 2, m) % MOD;
                invalid = (invalid + ways) % MOD;
            }
        }
    }

    long long ans = (total - invalid + MOD) % MOD;
    cout << ans << "\n";

    return 0;
}
```