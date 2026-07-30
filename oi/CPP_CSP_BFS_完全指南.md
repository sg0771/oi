# C++ CSP 竞赛广度优先搜索 (BFS) 完全指南

广度优先搜索（Breadth-First Search，简称 BFS）是信息学奥赛（CSP-J/S, NOIP）中最核心的搜索算法之一。它按“层”由近及远扩展节点，天然具备**求解无权图/等权图最短路径**的特性。

---

## 一、 BFS 的核心思想与模板

### 1. 核心原理
* **基本数据结构**：先进先出（FIFO）的**队列 (`std::queue`)**。
* **状态标记**：`visited` 数组（或 `dist` 数组），防止节点重复入队造成死循环。
* **搜索顺序**：逐层扩展，先入队者先处理。

### 2. 标准 C++ 代码模板 (网格图)

```cpp
#include <iostream>
#include <queue>
#include <vector>

using namespace std;

struct Point {
    int x, y;
    int step; // 记录步数或到达当前状态的成本
};

// 方向数组（上下左右）
const int dx[] = {-1, 1, 0, 0};
const int dy[] = {0, 0, -1, 1};

const int MAXN = 1005;
char grid[MAXN][MAXN];
bool vis[MAXN][MAXN];
int N, M;

bool isValid(int x, int y) {
    return x >= 0 && x < N && y >= 0 && y < M && grid[x][y] != '#' && !vis[x][y];
}

int bfs(int startX, int startY, int targetX, int targetY) {
    queue<Point> q;
    q.push({startX, startY, 0});
    vis[startX][startY] = true;

    while (!q.empty()) {
        Point curr = q.front();
        q.pop();

        // 终点判定
        if (curr.x == targetX && curr.y == targetY) {
            return curr.step;
        }

        // 扩展四个方向
        for (int i = 0; i < 4; ++i) {
            int nx = curr.x + dx[i];
            int ny = curr.y + dy[i];

            if (isValid(nx, ny)) {
                vis[nx][ny] = true; // 入队时立即标记，防止重复入队！
                q.push({nx, ny, curr.step + 1});
            }
        }
    }

    return -1; // 无法到达
}
```

> **🔑 避坑要点**：
> 1. **标记 visited 的时机**：一定要在**节点入队（`q.push`）时**立即设为 `true`，如果在**出队（`q.pop`）时**才标记，会导致同一个节点被多次推入队列，造成内存爆炸 (MLE) 或超时 (TLE)。

---

## 二、 CSP 进阶 BFS 变体与技巧

### 1. 0-1 BFS（双端队列 `std::deque`）
* **适用场景**：边权仅为 **0 或 1** 的图（例如：走平路成本 0，推箱子/破坏墙壁成本 1）。
* **核心思想**：
  * 扩展边权为 **0** 的节点：从**队头**插入（`q.push_front`）。
  * 扩展边权为 **1** 的节点：从**队尾**插入（`q.push_back`）。
* **时间复杂度**：$\mathcal{O}(V + E)$，比 Dijkstra 效率更高。

```cpp
#include <deque>

struct Node { int u, w; };
vector<vector<Node>> adj;
vector<int> dist;

void zero_one_bfs(int startNode, int n) {
    dist.assign(n + 1, 1e9);
    deque<int> dq;

    dist[startNode] = 0;
    dq.push_back(startNode);

    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();

        for (auto& edge : adj[u]) {
            int v = edge.u;
            int weight = edge.w;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                if (weight == 0) {
                    dq.push_front(v); // 边权0放队头
                } else {
                    dq.push_back(v);  // 边权1放队尾
                }
            }
        }
    }
}
```

### 2. 多源 BFS (Multi-source BFS)
* **适用场景**：有多个起点，求地图上每个点到**最近起点**的距离（如：多个火源扩散、多个快递站送货）。
* **处理方式**：初始时将**所有起点一并放入队列**（距离记为 0），再执行常规 BFS。

### 3. 双向 BFS (Bidirectional BFS)
* **适用场景**：起点和终点均确定，且搜索树分支因子巨大（如：八数码、魔方、状态图转换）。
* **核心思想**：起点正向扩展，终点反向扩展。每次优先选择**当前队列较小的一端**进行单步扩展，当两边搜索碰撞时即得到最短路径。可以将搜索空间从 $\mathcal{O}(b^d)$ 压缩到 $\mathcal{O}(b^{d/2})$。

---

## 三、 CSP 历年经典 BFS 题单与拆解

| 题号 / 来源 | 题目名称 | 考察点 / 核心模型 | 难度梯度 |
| :--- | :--- | :--- | :--- |
| **CSP-J 2024 T4** | *走迷宫* | 状态机 BFS / 结合步数与剩余状态的网格图 | 普及+ / 提高- |
| **CSP-J 2022 T3** | *逻辑表达式* | 表达式树遍历 / 树形 BFS 或 DFS | 普及+ |
| **CSP-S 2022 T1** | *假期计划* | 基础 BFS 预处理（计算两两节点的最短路）+ 枚举 | 提高 |
| **CSP-J 2019 T4** | *加工零件* | 奇偶最短路（状态定义为 `(u, parity)` 的 BFS） | 普及+ |
| **NOIP 2017 普及 T3** | *棋盘* | 0-1 BFS / 带花费转换的网格搜索 | 普及 |
| **NOIP 2016 普及 T3** | *海港* | 滑动窗口 + 单向队列模拟（广义 BFS 思想） | 普及 |

---

## 四、 状态定义技巧（升华与解题秘籍）

在 CSP-S / CSP-J 后两题中，BFS 往往**不是单纯记录 `(x, y)`**，而是需要扩展状态维度：

1. **带状态的 BFS**：
   * 如果地图上有开关、钥匙或技能（如破墙次数 $k$），访问标记需要设为 `vis[x][y][k]`。
2. **奇偶/同余状态**：
   * 如 CSP-J 2019 *加工零件*，需要记录到达节点 $u$ 路径长度为奇数还是偶数，使用 `dist[u][0/1]`。
3. **状态压缩 BFS**：
   * 当物品/钥匙数量小于 15 时，可以用二进制掩码 `mask` 记录拥有状态，定义 `vis[x][y][mask]`。

---

## 五、 常见的死因与调试 checklist

* [ ] **MLE（内存超限）**：检查是否未在入队时打 visited 标记；或者状态空间太大未加剪枝。
* [ ] **TLE（超时）**：检查数组边界及障碍条件，是否存在无效的重复推队列行为。
* [ ] **状态清空**：多组测试数据（如 `T` 组询问）时，清空 `queue` 及重置 `vis` / `dist` 数组。
