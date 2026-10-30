## 万能头
~~~cpp
#include <bits/stdc++.h>
using namespace std;
#define long long ll  #很多乘加运算用long容易溢出
int main() {
    ## 优化标准 I/O 读取速度
    ios::sync_with_stdio(false);//关闭同步，不能混用 cin 和 scanf /cout 和 printf
    cin.tie(0);
    // CSP复赛一定要写freopen！测试时注释掉
    freopen("xxx.in", "r", stdin);//题目会指定输入输出
    freopen("xxx.out", "w", stdout);
    // ⚠️ 一定要用 '\n'，不要 endl！endl 会强制刷新缓冲区，很慢
    // 你的代码
    return 0;
}
~~~

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

### 0-1,完全背包
~~~cpp
//N  为物品数量
//V  为背包容量
//第 i 件物品的体积是 Wi，价值是 Vi
​
//0-1背包
int solve_01_knapsack(int N, int V, const vector<int>& w, const vector<int>& v) {
    vector<int> dp(V + 1, 0);//初始化一个长度为V+1的全0数组，注意从下标从0开始
    for (int i = 0; i < N; ++i) {
        // 必须逆序枚举容量！
        // 保证计算 dp[j] 时用到的 dp[j - w[i]] 仍然是上一层(i-1) 的状态
        for (int j = V; j >= w[i]; --j) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[V];
}

//完全背包
int solve_complete_knapsack(int N, int V, const vector<int>& w, const vector<int>& v) {
   vector<int> dp(V + 1, 0);//初始化一个长度为V+1的全0数组，注意从下标从0开始
    for (int i = 0; i < N; ++i) {
        // 正序枚举容量，允许同一种物品被多次选取
        for (int j = w[i]; j <= V; ++j) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[V];
}
~~~

##  二分答案模板
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
