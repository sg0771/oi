# C++ CSP 竞赛动态规划：背包问题 (Knapsack Problems) 完全指南

背包问题（Knapsack Problem）是信息学奥赛（CSP-J/S, NOIP）中频次最高、变体最丰富的动态规划（DP）题型之一。理解并熟练掌握各类背包问题的**状态定义、状态转移方程以及空间优化**，是拿到 CSP 高分的必备技能。

---

## 一、 背包问题基本分类

根据物品的**使用次数限制**及**组别约束**，经典的背包问题可以分为以下几种：

1. **0/1 背包**：每种物品最多只能选 1 次。
2. **完全背包**：每种物品可以选无限次。
3. **多重背包**：每种物品最多可以选 $s_i$ 次（二进制拆分 / 单调队列优化）。
4. **分组背包**：物品被分为若干组，每组最多只能选 1 个物品。
5. **二维费用 / 混合背包**：约束条件增加或多种背包规则混合。

---

## 二、 核心题型拆解与模板

### 1. 0/1 背包问题

* **题意**：有 $N$ 件物品和一个容量为 $V$ 的背包。第 $i$ 件物品的体积是 $w_i$，价值是 $v_i$。每种物品只有一件，求将哪些物品装入背包可使价值总和最大。
* **状态定义**：$dp[i][j]$ 表示前 $i$ 个物品放入容量为 $j$ 的背包中的最大价值。
* **状态转移方程**：
  $$dp[i][j] = \max(dp[i-1][j], dp[i-1][j - w_i] + v_i) \quad (j \ge w_i)$$

#### 滚动数组空间优化（一维数组）
为了将空间复杂度从 $\mathcal{O}(N \times V)$ 降至 $\mathcal{O}(V)$，我们需要**逆序枚举容量**：

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int solve_01_knapsack(int N, int V, const vector<int>& w, const vector<int>& v) {
    vector<int> dp(V + 1, 0);

    for (int i = 0; i < N; ++i) {
        // 必须逆序枚举容量！
        // 保证计算 dp[j] 时用到的 dp[j - w[i]] 仍然是上一层 (i-1) 的状态
        for (int j = V; j >= w[i]; --j) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[V];
}
```

> **🔑 避坑要点**：一维 0/1 背包的容量遍历**必须从大到小（逆序）**，若正序遍历，同一个物品会被重复选取多次，从而退化成完全背包。

---

### 2. 完全背包问题

* **题意**：有 $N$ 种物品，每种物品有**无限件**可用。
* **状态转移方程**：
  $$dp[i][j] = \max(dp[i-1][j], dp[i][j - w_i] + v_i)$$

#### 空间优化（一维正序遍历）
与 0/1 背包唯一的代码差别：**容量必须正序（从小到大）枚举**，允许利用当前阶段已更新的值进行叠加。

```cpp
int solve_complete_knapsack(int N, int V, const vector<int>& w, const vector<int>& v) {
    vector<int> dp(V + 1, 0);

    for (int i = 0; i < N; ++i) {
        // 正序枚举容量，允许同一种物品被多次选取
        for (int j = w[i]; j <= V; ++j) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[V];
}
```

---

### 3. 多重背包问题（二进制拆分优化）

* **题意**：第 $i$ 种物品最多有 $s_i$ 件。
* **直接朴素解法**：三重循环，时间复杂度为 $\mathcal{O}(V \sum s_i)$，在 $s_i$ 较大时易 TLE。
* **二进制拆分优化**：将数量 $s_i$ 的同类物品拆分成若干个独立的新物品，新物品的数量依次为 $1, 2, 4, 8, \dots, 2^k, R$（满足 $\sum = s_i$）。这些组合可以凑出 $[0, s_i]$ 范围内的任意数量。拆分后直接转化为 **0/1 背包**。
* **优化后复杂度**：$\mathcal{O}(V \sum \log_2 s_i)$。

```cpp
int solve_bounded_knapsack(int N, int V, const vector<int>& w, const vector<int>& v, const vector<int>& s) {
    vector<int> new_w, new_v;

    // 二进制拆分打包
    for (int i = 0; i < N; ++i) {
        int count = s[i];
        int k = 1;
        while (k <= count) {
            new_w.push_back(k * w[i]);
            new_v.push_back(k * v[i]);
            count -= k;
            k *= 2;
        }
        if (count > 0) {
            new_w.push_back(count * w[i]);
            new_v.push_back(count * v[i]);
        }
    }

    // 转化后的 0/1 背包求解
    vector<int> dp(V + 1, 0);
    for (size_t i = 0; i < new_w.size(); ++i) {
        for (int j = V; j >= new_w[i]; --j) {
            dp[j] = max(dp[j], dp[j - new_w[i]] + new_v[i]);
        }
    }
    return dp[V];
}
```

---

### 4. 分组背包问题

* **题意**：物品被划分为 $K$ 个组，每组包含若干物品，**每组最多只能选择 1 个物品**。
* **核心思路**：先枚举组，再**逆序枚举容量**，最后枚举该组内的各个物品。

```cpp
struct Item { int w, v; };

int solve_group_knapsack(int K, int V, const vector<vector<Item>>& groups) {
    vector<int> dp(V + 1, 0);

    for (int k = 0; k < K; ++k) { // 1. 枚举组
        for (int j = V; j >= 0; --j) { // 2. 逆序枚举容量
            for (const auto& item : groups[k]) { // 3. 枚举组内物品
                if (j >= item.w) {
                    dp[j] = max(dp[j], dp[j - item.w] + item.v);
                }
            }
        }
    }
    return dp[V];
}
```

> **🔑 循环顺序关键**：必须组别在外层，容量在中层（逆序），组内物品在内层。如果把容量放内层，就会导致同一组内选择多个物品。

---

## 三、 背包问题的两大常见目标变体

### 1. 求恰好装满背包的最大价值
* **初始化**：$dp[0] = 0$，其余 $dp[1 \dots V] = -\infty$（或一个很小的负数如 `-1e9`）。
* **含义**：表示初始时除了容量 0 为合法状态外，其余容量均不合法（尚未被恰好填满）。

### 2. 求方案数（如凑硬币面值）
* **状态定义**：$dp[j]$ 表示恰好凑满容量 $j$ 的方案数。
* **初始化**：$dp[0] = 1$，其余 $dp[1 \dots V] = 0$。
* **转移方程**：
  $$dp[j] = dp[j] + dp[j - w_i]$$

---

## 四、 CSP 历年经典背包题单

| 题号 / 来源 | 题目名称 | 考察点 / 背包模型 | 难度梯度 |
| :--- | :--- | :--- | :--- |
| **CSP-J 2019 T3** | *纪念品* | 完全背包 (连续天数间买卖状态转化) | 普及+ |
| **NOIP 2012 普及 T3** | *摆花* | 多重背包变体 / 恰好凑满方案数 DP | 普及 |
| **NOIP 2006 普及 T2** | *开心的金明* | 基础 0/1 背包 | 普及- |
| **NOIP 2006 普及 T3** | *金明的预算方案* | 树形背包 / 分组背包变体（主件与附件关系） | 普及+ / 提高- |
| **NOIP 2005 普及 T3** | *采药* | 模板 0/1 背包 | 普及- |
| **NOIP 2001 普及 T1** | *装箱问题* | 0/1 背包变体（尽可能填满容量） | 普及- |
| **NOIP 2018 提高 T2** | *货币系统* | 完全背包 (求解等价货币最小集合) | 提高- |
| **NOIP 2014 提高 T1** | *飞扬的小鸟* | 完全背包 (上升操作) + 0/1 背包 (下降) | 提高 |

---

## 五、 背包问题总结与避坑 Checklist

1. **容量方向区分**：
   * 0/1 背包、分组背包、二进制拆分多重背包 $\rightarrow$ **逆序遍历容量**（$V \rightarrow w_i$）。
   * 完全背包 $\rightarrow$ **正序遍历容量**（$w_i \rightarrow V$）。
2. **初始化敏感性**：
   * 求最大价值（无需装满）：`dp` 全设为 `0`。
   * 求最大价值（必须恰好装满）：`dp[0] = 0`，其余设为 `-INF`。
   * 求方案数：`dp[0] = 1`，其余设为 `0`。
3. **数据范围与数据类型**：
   * 价值总和是否可能超出 `int` 范围？若是，使用 `long long` 类型的 `dp` 数组。
   * 物品体积或背包容量很大时（如 $V \ge 10^9$），可能需要转换维度，将“价值”设为 DP 状态而“体积”作为 DP 值，或采用折半搜索（Meet-in-the-middle）。
