# CSP 复赛常用C++算法模板合集
> 全部模板可直接复制到CSP比赛环境使用，逐行注释，覆盖CSP-J/S所有高频考点。编译标准：C++14 / C++17。

---

## 1. 基础工具
### 快读模板（处理1e6以上输入）
```cpp
#include <bits/stdc++.h>
using namespace std;
// 快速读入整数，比cin快10倍以上
inline int read() {
    int x = 0, f = 1; char ch = getchar();
    // 处理负号
    while (ch < '0' || ch > '9') { if (ch == '-') f = -1; ch = getchar(); }
    // 拼接数字
    while (ch >= '0' && ch <= '9') { x = x * 10 + ch - '0'; ch = getchar(); }
    return x * f;
}
int main() {
    int n = read(); // 直接调用读入
    return 0;
}
```

### 常用头文件与宏
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const int MOD = 1e9 + 7;
const int INF = 0x3f3f3f3f; // 表示正无穷
// 取模安全减法：避免负数
ll mod_sub(ll a, ll b, ll mod) { return ((a - b) % mod + mod) % mod; }
```

---

## 2. 数论模块
### 欧几里得算法求gcd
```cpp
ll gcd(ll a, ll b) {
    // 辗转相除，直到b为0
    return b == 0 ? a : gcd(b, a % b);
}
ll lcm(ll a, ll b) {
    // 最小公倍数，先除后乘防溢出
    return a / gcd(a, b) * b;
}
```

### 快速幂（模意义下）
```cpp
// 计算 (base^power) % mod，O(log power)
ll qpow(ll base, ll power, ll mod) {
    ll res = 1;
    base %= mod;
    while (power > 0) {
        // 当前二进制位为1，乘上当前base
        if (power & 1) res = res * base % mod;
        // base平方，幂次右移一位
        base = base * base % mod;
        power >>= 1;
    }
    return res;
}
```

### 线性筛（欧拉筛，预处理质数与欧拉函数）
```cpp
const int MAXN = 1e6 + 10;
bool is_not_prime[MAXN]; // 标记是否非质数
int prime[MAXN], cnt = 0; // 存质数列表
int phi[MAXN]; // 欧拉函数值

void sieve() {
    is_not_prime[0] = is_not_prime[1] = true;
    phi[1] = 1;
    for (int i = 2; i < MAXN; i++) {
        if (!is_not_prime[i]) {
            prime[++cnt] = i;
            phi[i] = i - 1; // 质数的phi值
        }
        // 筛掉所有i * 质数
        for (int j = 1; j <= cnt && i * prime[j] < MAXN; j++) {
            is_not_prime[i * prime[j]] = true;
            if (i % prime[j] == 0) {
                phi[i * prime[j]] = phi[i] * prime[j];
                break;
            }
            phi[i * prime[j]] = phi[i] * (prime[j] - 1);
        }
    }
}
```

---

## 3. 数据结构模块
### 并查集（路径压缩+按秩合并）
```cpp
const int MAXN = 1e5 + 10;
int fa[MAXN], rnk[MAXN];
// 初始化：每个点的父节点是自己，秩为1
void init_dsu(int n) {
    for (int i = 1; i <= n; i++) fa[i] = i, rnk[i] = 1;
}
// 找根节点，带路径压缩
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}
// 合并两个集合
void unite(int x, int y) {
    x = find(x), y = find(y);
    if (x == y) return;
    // 小树接到大树下面，保持平衡
    if (rnk[x] < rnk[y]) swap(x, y);
    fa[y] = x;
    rnk[x] += rnk[y];
}
```

### 堆优化Dijkstra最短路
```cpp
#include <vector>
#include <queue>
const int MAXN = 1e5 + 10;
const ll INF = 1e18;
struct Edge { int to; ll w; };
vector<Edge> g[MAXN]; // 邻接表存图
ll dis[MAXN];
bool vis[MAXN];

// 从起点s出发，求到所有点的最短路
void dijkstra(int s, int n) {
    // 初始化距离为无穷大
    for (int i = 1; i <= n; i++) dis[i] = INF, vis[i] = false;
    dis[s] = 0;
    // 小根堆：{距离, 节点}
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<pair<ll, int>>> pq;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (vis[u]) continue;
        vis[u] = true;
        // 松弛相邻边
        for (auto e : g[u]) {
            int v = e.to; ll w = e.w;
            if (dis[v] > dis[u] + w) {
                dis[v] = dis[u] + w;
                pq.push({dis[v], v});
            }
        }
    }
}
```

---

## 4. 搜索与DP模块
### BFS模板（无权图最短路）
```cpp
#include <queue>
const int MAXN = 1005;
int dx[] = {0, 0, 1, -1}, dy[] = {1, -1, 0, 0}; // 四个方向
int n, m;
char grid[MAXN][MAXN];
int dist[MAXN][MAXN];

void bfs(int sx, int sy) {
    memset(dist, -1, sizeof(dist));
    queue<pair<int, int>> q;
    q.push({sx, sy});
    dist[sx][sy] = 0;
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        // 遍历四个方向
        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            // 边界判断、未访问、可通行
            if (nx < 1 || nx > n || ny < 1 || ny > m) continue;
            if (dist[nx][ny] != -1 || grid[nx][ny] == '#') continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
}
```

### 01背包DP模板
```cpp
// n个物品，背包总容量W
// w[i]是物品重量，v[i]是物品价值
int n, W;
int w[1005], v[1005];
int dp[1005]; // dp[j]表示容量j的背包能装的最大价值

void knapsack() {
    memset(dp, 0, sizeof(dp));
    for (int i = 1; i <= n; i++) {
        // 逆序遍历，防止重复选同一物品
        for (int j = W; j >= w[i]; j--) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    // 答案是dp[W]
}
```

---

## 5. 二分答案模板
```cpp
// 题目：求最大值最小，check(x)表示x是否满足条件
bool check(int x) {
    // 在这里写判断逻辑
    return true;
}
int binary_search(int l, int r) {
    int ans = l;
    while (l <= r) {
        int mid = (l + r) / 2;
        if (check(mid)) {
            ans = mid;
            l = mid + 1; // 满足条件，尝试更大的值
        } else {
            r = mid - 1; // 不满足，缩小上界
        }
    }
    return ans;
}
```
