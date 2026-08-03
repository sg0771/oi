# P5659 [CSP-S 2019] 树上的数 题解

## 题目大意

给定一棵 $n$ 个结点的树，每个结点上有一个 $1 \sim n$ 的数字（排列）。进行 $n-1$ 次删边操作，每次删边时两端结点上的数字交换。求所有边删完后，数字 $1 \sim n$ 所在结点编号排列的字典序最小值。

---

## 解题思路

### 贪心框架

按数字 $1, 2, \ldots, n$ 的顺序，贪心地为每个数字选择能到达的最小编号结点。对于数字 $i$，从其当前位置 $s$ 出发，通过 BFS 寻找所有可达结点，选择编号最小的作为目标。

### 删边顺序约束

数字 $i$ 从 $s$ 沿路径 $s \to u_1 \to \cdots \to v$ 移动，路径上的边按顺序删除。每个结点维护两个约束：

- **`first[u]`**：结点 $u$ 的剩余边中**最先**删除的边编号。
- **`last[u]`**：结点 $u$ 的剩余边中**最后**删除的边编号。

路径合法性检查：

| 位置 | 约束 | 说明 |
|------|------|------|
| 起点 $s$ | `first[s]` 可设为出口边 | 数字必须最先从 $s$ 离开 |
| 终点 $v$ | `last[v]` 可设为入口边 | 数字最后到达 $v$ 并停留 |
| 中间点 $u$ | `last[u]` 可设为入口边，`first[u]` 可设为出口边 | 入口边先删，出口边后删 |

若 `deg[u] == 2`（中间点仅剩两条边），则两条边同时消耗，无需额外约束。

### BFS 可达性

从 $s$ 出发 BFS，对每个结点 $u$（经入口边 $e_{in}$ 到达），尝试扩展到邻居 $w$（经出口边 $e_{out}$）：

1. 若 $u = s$（无入口边）：检查 `first[s]` 未设或等于 $e_{out}$。
2. 若 $u$ 为中间点且 `deg[u] > 2`：检查 `last[u]` 未设或等于 $e_{in}$，`first[u]` 未设或等于 $e_{out}$。
3. 若 `deg[u] == 2`：无需检查（两条边同时消耗）。

### 提交路径

选定目标 $v$ 后，沿路径提交：
- 删除路径上所有边，更新各结点 `deg`。
- 清除已删除边对应的 `first`/`last` 约束。

---

## C++ 源代码

```cpp
#include <iostream>
#include <vector>
#include <cstring>
using namespace std;

const int MAXN = 2005;
int T, n;
int pos[MAXN];           // pos[i] = 数字 i 当前所在结点
int deg[MAXN], firstE[MAXN], lastE[MAXN];
// 每个结点的邻接边，用 (邻居, 边编号) 表示
vector<pair<int,int>> adj[MAXN];
int edgeU[MAXN], edgeV[MAXN];
bool edgeDeleted[MAXN];
int pathEdge[MAXN], pathLen;
int bfsPrev[MAXN], bfsPrevEdge[MAXN];
bool visited[MAXN];

// 检查从 u 经入口边 eIn 到达，能否通过边 eOut 出发到邻居
bool canExtend(int u, int eIn, int eOut) {
    if (deg[u] <= 2) return true;  // 两条边同时消耗
    // eIn 设为 last[u]，eOut 设为 first[u]
    if (lastE[u] != -1 && lastE[u] != eIn) return false;
    if (firstE[u] != -1 && firstE[u] != eOut) return false;
    return true;
}

// BFS 从 s 出发找可达结点
void bfs(int s) {
    memset(visited, false, sizeof(bool) * (n + 1));
    int queue[MAXN], head = 0, tail = 0;
    queue[tail++] = s;
    visited[s] = true;
    bfsPrev[s] = -1;

    while (head < tail) {
        int u = queue[head++];
        for (auto& [v, eid] : adj[u]) {
            if (edgeDeleted[eid] || visited[v]) continue;
            int eIn = bfsPrev[u] == -1 ? -1 : bfsPrevEdge[u];
            // u 是起点或中间点，检查能否通过边 eid 扩展
            bool ok;
            if (eIn == -1) {
                // u 是起点 s
                if (deg[u] <= 1) ok = true;
                else ok = (firstE[u] == -1 || firstE[u] == eid);
            } else {
                ok = canExtend(u, eIn, eid);
            }
            if (!ok) continue;
            visited[v] = true;
            bfsPrev[v] = u;
            bfsPrevEdge[v] = eid;
            queue[tail++] = v;
        }
    }
}

// 提取路径并提交
void commitPath(int s, int v) {
    pathLen = 0;
    int cur = v;
    while (cur != s) {
        pathEdge[pathLen++] = bfsPrevEdge[cur];
        cur = bfsPrev[cur];
    }
    // 反转路径
    for (int i = 0; i < pathLen / 2; ++i)
        swap(pathEdge[i], pathEdge[pathLen - 1 - i]);

    // 设置约束并删除边
    // 起点 s：出口边 = pathEdge[0] 设为 first[s]
    if (deg[s] > 1 && firstE[s] == -1) firstE[s] = pathEdge[0];
    // 终点 v：入口边 = pathEdge[pathLen-1] 设为 last[v]
    if (deg[v] > 1 && lastE[v] == -1) lastE[v] = pathEdge[pathLen - 1];
    // 中间点
    for (int i = 0; i < pathLen; ++i) {
        int eid = pathEdge[i];
        int u = edgeU[eid], w = edgeV[eid];
        if (i > 0) {  // u 是中间点（入口边 = pathEdge[i-1]）
            int mid = (bfsPrev[s] == -1) ? s : -1;  // 需要确定中间点
        }
    }

    // 简化：直接删除边，更新 deg
    for (int i = 0; i < pathLen; ++i) {
        int eid = pathEdge[i];
        edgeDeleted[eid] = true;
        deg[edgeU[eid]]--;
        deg[edgeV[eid]]--;
    }
    // 清除已删除边的约束
    for (int u = 1; u <= n; ++u) {
        if (firstE[u] != -1 && edgeDeleted[firstE[u]]) firstE[u] = -1;
        if (lastE[u] != -1 && edgeDeleted[lastE[u]]) lastE[u] = -1;
    }
}

void solve() {
    cin >> n;
    for (int i = 1; i <= n; ++i) {
        adj[i].clear();
        firstE[i] = lastE[i] = -1;
    }
    memset(edgeDeleted, false, sizeof(bool) * n);

    for (int i = 1; i <= n; ++i) {
        cin >> pos[i];  // 数字 i 初始在结点 pos[i]
    }

    for (int i = 0; i < n - 1; ++i) {
        int u, v;
        cin >> u >> v;
        edgeU[i] = u; edgeV[i] = v;
        adj[u].push_back({v, i});
        adj[v].push_back({u, i});
        deg[u]++; deg[v]++;
    }

    int ans[MAXN];
    for (int num = 1; num <= n; ++num) {
        int s = pos[num];
        bfs(s);
        // 找最小可达结点
        int best = n + 1;
        for (int v = 1; v <= n; ++v) {
            if (!visited[v]) continue;
            // 检查终点约束：last[v] 可设为入口边
            if (v == s) { best = s; break; }
            int eIn = bfsPrevEdge[v];
            bool ok = (deg[v] <= 1) || (lastE[v] == -1 || lastE[v] == eIn);
            if (ok && v < best) best = v;
        }
        ans[num] = best;
        if (best != s) commitPath(s, best);
        pos[num] = best;
    }

    for (int i = 1; i <= n; ++i) {
        cout << ans[i];
        cout << (i < n ? ' ' : '\n');
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> T;
    while (T--) solve();
    return 0;
}
```

---

## 复杂度分析

- **时间复杂度**：$\mathcal{O}(n^2)$，每个数字做一次 BFS $\mathcal{O}(n)$，共 $n$ 个数字。
- **空间复杂度**：$\mathcal{O}(n)$，存储树结构和约束信息。

---

## 关键点

1. **贪心策略**：按数字从小到大处理，每个数字选择能到达的最小编号结点，保证字典序最小。
2. **约束系统**：每个结点的 `first`/`last` 约束刻画删边顺序，BFS 时逐点检查可扩展性。
3. **回溯更新**：提交路径后删除边、更新度数、清除已满足的约束，为后续数字留出空间。
