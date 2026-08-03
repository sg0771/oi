# P5666 [CSP-S 2019] 树的重心 题解

## 题目大意

给定一棵 $n$ 个结点的树，对每条边删除后分裂出的两棵子树，分别求其重心编号之和，最后对所有边求和。

---

## 解题思路

### 重心性质

树的重心是删去后所有子树大小不超过 $\lfloor n/2 \rfloor$ 的结点。重心有 1 或 2 个（2 个时必相邻）。

### 总体思路

以 1 为根，预处理子树大小 `sz[]`、倍增父结点 `up[][k]`、重儿子 `heavy[]`（子树最大的儿子）。对每条边 $(u, v)$（$v$ 是 $u$ 的儿子），分别求 $v$ 子树（大小 $s = \text{sz}[v]$）和剩余部分（大小 $n - s$）的重心。

### $v$ 侧重心（子树大小 $s$）

从 $v$ 出发沿重儿子链向下，找最深的满足 $\text{sz}[c] > s/2$ 的结点 $c$。此时：

- $c$ 的重儿子 $\text{sz}[\text{heavy}[c]] \le s/2$，$c$ 上方分量 $s - \text{sz}[c] < s/2$，故 $c$ 是重心。
- 若 $\text{sz}[\text{heavy}[c]] \times 2 = s$（$s$ 为偶数且重儿子恰好 $s/2$），则 $\text{heavy}[c]$ 也是重心。

用倍增沿重儿子链跳跃，$\mathcal{O}(\log n)$ 完成。

### $u$ 侧重心（剩余部分大小 $n - s$）

剩余部分的重心在根到 $u$ 的路径上。对路径上的结点 $c$（$v$ 的祖先），删除 $c$ 后各分量为：

- 上方分量：$n - \text{sz}[c]$
- 通往 $v$ 方向的儿子分量：$\text{sz}[w] - s$（$w$ 是 $c$ 在路径上的儿子）
- 其他儿子分量：$\text{sz}[\text{son}]$

重心条件：所有分量 $\le (n-s)/2$。

**上方分量约束**：$n - \text{sz}[c] \le (n-s)/2 \Rightarrow \text{sz}[c] \ge (n+s)/2$。

用倍增从 $u$ 向上找最深的满足 $\text{sz}[c] \ge (n+s)/2$ 的祖先 $c$。若 $c$ 的非路径方向最大儿子也 $\le (n-s)/2$，则 $c$ 是重心。若 $\text{sz}[c] \times 2 = n + s$，则 $c$ 的父结点也是重心。

若非路径最大儿子 $> (n-s)/2$，则重心在该儿子子树内，用 $v$ 侧相同方法查找。

---

## C++ 源代码

```cpp
#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 300005;
const int LOG = 20;

int T, n;
vector<int> adj[MAXN];
int sz[MAXN], dep[MAXN], heavy[MAXN];
int up[MAXN][LOG];      // 倍增父结点
int jumpH[MAXN][LOG];   // 沿重儿子链倍增

void dfs1(int u, int fa, int d) {
    sz[u] = 1; dep[u] = d; heavy[u] = 0;
    up[u][0] = fa;
    for (int k = 1; k < LOG; ++k)
        up[u][k] = up[up[u][k-1]][k-1];

    int maxSz = 0;
    for (int v : adj[u]) {
        if (v == fa) continue;
        dfs1(v, u, d + 1);
        sz[u] += sz[v];
        if (sz[v] > maxSz) { maxSz = sz[v]; heavy[u] = v; }
    }
    jumpH[u][0] = heavy[u];
    for (int k = 1; k < LOG; ++k)
        jumpH[u][k] = jumpH[jumpH[u][k-1]][k-1];
}

// 判断 a 是否为 b 的祖先
bool isAncestor(int a, int b) {
    if (dep[a] > dep[b]) return false;
    int diff = dep[b] - dep[a];
    for (int k = 0; k < LOG; ++k)
        if ((diff >> k) & 1) b = up[b][k];
    return a == b;
}

// 求子树（大小 s，根 root）的重心编号和
// rootSubtree: root 子树中所有结点，用 sz 数组
int findCentroidSubtree(int root, int s) {
    int c = root;
    for (int k = LOG - 1; k >= 0; --k) {
        int nxt = jumpH[c][k];
        if (nxt != 0 && sz[nxt] > s / 2)
            c = nxt;
    }
    // c 是最深的 sz > s/2 的结点，c 是重心
    int sum = c;
    // 检查重儿子是否也是重心
    if (heavy[c] != 0 && sz[heavy[c]] * 2 == s)
        sum += heavy[c];
    return sum;
}

// 求 u 侧（剩余部分，大小 n-s）的重心编号和
int findCentroidRest(int u, int v, int s) {
    int restSize = n - s;
    int half = restSize / 2;

    // 从 u 向上找最深的祖先 c（v 的祖先），满足 sz[c] >= (n+s)/2
    int threshold = (n + s) / 2;
    int c = u;
    if (sz[u] < threshold) {
        // 需要向上找
        for (int k = LOG - 1; k >= 0; --k) {
            int p = up[c][k];
            if (p != 0 && sz[p] < threshold)
                c = p;
        }
        c = up[c][0];  // c 的父结点满足 sz >= threshold
    }

    // 检查 c 的非路径方向最大儿子
    // 路径方向儿子 = c 在到 v 路径上的儿子
    int maxNonPath = 0;
    for (int w : adj[c]) {
        if (w == up[c][0]) continue;  // 跳过父结点
        if (isAncestor(w, v) || w == v) continue;  // 跳过路径方向
        maxNonPath = max(maxNonPath, sz[w]);
    }

    if (maxNonPath <= half) {
        // c 是重心
        int sum = c;
        // 检查 c 的父结点是否也是重心
        if (up[c][0] != 0 && sz[c] * 2 == n + s)
            sum += up[c][0];
        return sum;
    } else {
        // 重心在 maxNonPath 对应的儿子子树内
        // 找到该儿子
        int target = 0;
        for (int w : adj[c]) {
            if (w == up[c][0]) continue;
            if (isAncestor(w, v) || w == v) continue;
            if (sz[w] == maxNonPath) { target = w; break; }
        }
        // 在 target 子树中找重心（子树大小 restSize）
        // 最深的 sz >= half 的后代
        int cc = target;
        for (int k = LOG - 1; k >= 0; --k) {
            int nxt = jumpH[cc][k];
            if (nxt != 0 && sz[nxt] > half)
                cc = nxt;
        }
        int sum = cc;
        if (heavy[cc] != 0 && sz[heavy[cc]] * 2 == restSize)
            sum += heavy[cc];
        return sum;
    }
}

void solve() {
    cin >> n;
    for (int i = 1; i <= n; ++i) adj[i].clear();
    for (int i = 0; i < n - 1; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    dfs1(1, 0, 0);

    long long ans = 0;
    // 对每条边，v 是 u 的儿子
    for (int u = 1; u <= n; ++u) {
        for (int v : adj[u]) {
            if (v == up[u][0]) continue;  // v 是父结点，跳过
            // v 是 u 的儿子
            int s = sz[v];
            ans += findCentroidSubtree(v, s);
            ans += findCentroidRest(u, v, s);
        }
    }
    cout << ans << "\n";
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

- **时间复杂度**：$\mathcal{O}(n \log n)$，预处理倍增 $\mathcal{O}(n \log n)$，每条边求重心 $\mathcal{O}(\log n)$。
- **空间复杂度**：$\mathcal{O}(n \log n)$，倍增数组。

---

## 关键点

1. **倍增进化**：沿重儿子链倍增找子树重心，沿父结点链倍增找剩余部分重心。
2. **双重心判定**：当某分量恰好等于一半时，存在两个相邻重心，编号都计入答案。
3. **非路径方向检查**：$u$ 侧重心可能在分支子树内，需检查非路径方向最大儿子是否越界。
