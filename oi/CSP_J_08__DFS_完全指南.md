# C++ CSP 竞赛深度优先搜索 (DFS) 完全指南

深度优先搜索（Depth-First Search，简称 DFS）是算法竞赛（CSP-J/S, NOIP）中最基础也是最重要的搜索思想之一。它沿图或树的深度方向遍历，遇到障碍或无法继续扩展时“回溯”（Backtracking），常用于**连通性判断、全排列/组合生成、路径搜索、状态空间树遍历**以及**剪枝优化**。

---

## 一、 DFS 的核心思想与基本模板

### 1. 核心原理
* **实现载体**：**系统调用栈（递归实现）** 或 手动维护的 `std::stack`。
* **核心动作**：
  * **深入（Explore）**：顺着一条路径一直走到底。
  * **回溯（Backtrack）**：撤销当前选择，退回上一状态，尝试其他路径。
* **三大要素**：
  1. **递归边界（Base Case）**：什么条件停止搜索并返回/统计答案。
  2. **状态转移与选择**：枚举当前层所有可能的分支。
  3. **现场恢复（Unvisit / Backtrack）**：如果搜索的是路径或组合，退栈时必须恢复状态标记。

---

### 2. 标准代码模板

#### 模板 A：网格图连通性 / 漫延搜索（无需回溯）

适用于求连通块数量（如 *扫雷*、*岛屿数量*）：

```cpp
#include <iostream>
using namespace std;

const int MAXN = 1005;
char grid[MAXN][MAXN];
bool vis[MAXN][MAXN];
int N, M;

const int dx[] = {-1, 1, 0, 0};
const int dy[] = {0, 0, -1, 1};

bool isValid(int x, int y) {
    return x >= 0 && x < N && y >= 0 && y < M && grid[x][y] != '#' && !vis[x][y];
}

void dfs(int x, int y) {
    vis[x][y] = true; // 标记访问（连通性只需访问一次，无需撤销）

    for (int i = 0; i < 4; ++i) {
        int nx = x + dx[i];
        int ny = y + dy[i];
        if (isValid(nx, ny)) {
            dfs(nx, ny);
        }
    }
}
```

#### 模板 B：状态空间搜索 / 路径穷举（需要回溯现场恢复）

适用于全排列、组合生成、路径求解：

```cpp
#include <iostream>
#include <vector>

using namespace std;

const int MAXN = 20;
bool vis[MAXN];
vector<int> path;
int n;

void dfs_permutation(int step) {
    // 1. 递归边界
    if (step > n) {
        for (int val : path) cout << val << " ";
        cout << "\n";
        return;
    }

    // 2. 枚举分支
    for (int i = 1; i <= n; ++i) {
        if (!vis[i]) {
            vis[i] = true;         // 标记现场
            path.push_back(i);

            dfs_permutation(step + 1); // 深入下一层

            path.pop_back();       // 恢复现场
            vis[i] = false;
        }
    }
}
```

---

## 二、 核心进阶：DFS 的四大剪枝技巧

在 CSP-S / NOIP 竞赛中，纯粹的 DFS 暴力（Exhaustive Search）通常只能拿到 20%~40% 的部分分。要拿到满分，必须结合**剪枝（Pruning）**或**记忆化（Memoization）**。

### 1. 可行性剪枝（Feasibility Pruning）
* **原理**：在搜索过程中，如果发现当前状态已经违背了题目的合法性条件，立刻 `return` 放弃该分支。
* **例**：求解背包问题时，当前累计重量已经超过容量上限 $W$。

### 2. 最优性剪枝（Optimality Pruning）
* **原理**：如果当前累计的花费/代价已经 **大于等于** 当前已找到的最优解代价，继续搜索绝无可能更新最优解，立刻 `return`。

```cpp
int min_cost = 1e9;

void dfs(int u, int current_cost) {
    // 最优性剪枝
    if (current_cost >= min_cost) return;

    if (u == target) {
        min_cost = min(min_cost, current_cost);
        return;
    }
    // ... 扩展下一步
}
```

### 3. 顺序剪枝（Search Order Pruning）
* **原理**：改变枚举分支的顺序，优先搜索“决策分支较少”或“更容易产生极值”的分支，从而极大地缩小后续搜索树规模。
* **例**：搜索组合问题时，优先放入大元素；搜数独时，优先填可选数字最少的格子。

### 4. 记忆化搜索（Memoization / DFS + DP）
* **原理**：将已计算过的状态结果存储在 `memo` 数组或 `dp` 数组中。下次再次遇到相同状态时直接返回结果，避免重复搜索。
* **本质**：DFS 形式的动态规划，通常将搜索树转为 DAG（有向无环图）。

```cpp
int memo[MAXN][MAXN];

int dfs_memo(int x, int y) {
    if (x == N && y == M) return 1;
    if (memo[x][y] != -1) return memo[x][y]; // 直接返回已知答案

    int res = 0;
    // ... 累加转移状态
    return memo[x][y] = res; // 记忆化保存
}
```

---

## 三、 CSP 历年经典 DFS 题单与模型

| 题号 / 来源 | 题目名称 | 考察点 / 核心模型 | 难度梯度 |
| :--- | :--- | :--- | :--- |
| **CSP-J 2022 T4** | *上升点序列* | 记忆化搜索 / 树形/网格 DP 模型 | 普及+ / 提高- |
| **CSP-J 2020 T4** | *方格取数* | 记忆化搜索 / 三方向网格路径搜索 | 普及+ / 提高- |
| **CSP-S 2020 T3** | *函数调用* | DAG 上的 DFS / 拓扑建图 + 递归计算 | 提高+ |
| **NOIP 2017 提高 T3** | *逛公园* | 带环图上的记忆化搜索 DFS | 提高+ |
| **NOIP 2015 提高 T3** | *斗地主* | 复杂状态的回溯搜索 + 严谨剪枝 | 提高+ |
| **NOIP 2004 普及 T4** | *火星人* | 排列枚举 / STL `std::next_permutation` 底层原理 | 普及 |
| **NOIP 2002 普及 T2** | *选数* | DFS 组合数选择模型 + 素数判定 | 普及- |

---

## 四、 DFS 与 BFS 的选择策略

| 维 度 | DFS (深度优先搜索) | BFS (广度优先搜索) |
| :--- | :--- | :--- |
| **数据结构** | 系统调用栈 / 手动栈 | 队列 (`std::queue`) |
| **空间复杂度** | $\mathcal{O}(d)$ （搜索深度，空间占用极小） | $\mathcal{O}(b^d)$ （广度层级节点数，易 MLE） |
| **最简路径** | 不具备（必须搜索整棵树才能确定最短路） | 天然具备（无权图中首次到达即为最短路） |
| **核心优势** | 代码编写极简、易配合回溯/剪枝/记忆化 | 求解最短路径问题绝不超深 |
| **典型适用场景** | 组合/排列穷举、博弈决策、记忆化 DP、连通块判断 | 无权网格图最短路、按层扩散问题 |

---

## 五、 DFS 常见踩坑与调试 Checklist

* [ ] **爆栈（Stack Overflow）**：
  * **原因**：递归深度过深（如 $N \ge 10^5$ 的树/图遍历），超出了系统栈空间限制。
  * **解决**：增加系统栈空间，或改写为手动维护栈的手写 DFS / BFS。
* [ ] **忘记恢复现场**：在求解“所有路径/组合”时，撤销标记（`vis[i] = false` 或 `path.pop_back()`）缺失导致少搜索分支。
* [ ] **记忆化搜索未清空**：`memo` 数组初始值应设为 `-1`（或特定无效值），若多组数据 `memset` 漏清空会导致跨组污染。
* [ ] **死循环递归**：图遍历中缺失 `vis` 标记导致出现环路，引发无限递归。
