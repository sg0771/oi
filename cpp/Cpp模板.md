## 1. DFS 深度优先搜索

> 
> DFS 基于递归，适合连通块遍历、回溯枚举、记忆化搜索；缺点：递归层数太深会栈溢出。

### 1.1 网格 DFS（迷宫、连通块，CSP-J 高频）

```
#include <iostream>
using namespace std;

const int N = 1005;
char mp[N][N];    // 存储地图
bool vis[N][N];   // 标记该点是否已经访问过
int n, m;
// 方向数组：上下左右四个方向
int dx[] = {-1, 1, 0, 0};
int dy[] = {0, 0, -1, 1};

// x,y 当前所在坐标
void dfs(int x, int y) {
    vis[x][y] = true; // 标记当前点已访问
    // 遍历4个方向
    for(int i = 0; i < 4; i++) {
        int nx = x + dx[i];
        int ny = y + dy[i];
        // 判断条件：不越界、未访问、不是障碍物
        if(nx >= 1 && nx <= n && ny >= 1 && ny <= m && !vis[nx][ny] && mp[nx][ny] != '#') {
            dfs(nx, ny);
        }
    }
}

int main() {
    cin >> n >> m;
    for(int i = 1; i <= n; i++) {
        cin >> mp[i] + 1;
    }
    return 0;
}
```

### 1.2 邻接表图 DFS（连通块遍历）

```
#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 1005;
vector<int> G[MAXN]; // 邻接表存图
bool vis[MAXN];      // 访问标记数组

void dfs(int u) {
    vis[u] = true;
    // 遍历u点所有相邻节点
    for(int v : G[u]) {
        if(!vis[v]) {
            dfs(v);
        }
    }
}

int main() {
    return 0;
}
```

### 1.3 回溯 DFS（排列 / 子集枚举，需要撤销标记）

```
#include <iostream>
using namespace std;
const int MAXN = 20;
int a[MAXN];
bool vis[MAXN];
int n;

void dfs(int step) {
    if(step == n) { // 递归边界：已经选完n个元素，得到一组完整方案
        // 此处写输出方案代码
        return;
    }
    for(int i = 1; i <= n; i++) {
        if(!vis[i]) {
            vis[i] = true;    // 标记选择
            a[step] = i;
            dfs(step + 1);
            vis[i] = false;   // 回溯：撤销标记
        }
    }
}

int main() {
    cin >> n;
    dfs(0);
    return 0;
}
```

## 2. BFS 广度优先搜索

> 
> BFS 基于队列，**天然适合求无权图最短路径**；不会出现 DFS 栈溢出问题，按层遍历。

### 2.1 网格 BFS（迷宫最短路径）

```
#include <iostream>
#include <queue>
using namespace std;

const int N = 1005;
char mp[N][N];
int dist[N][N]; // dist[x][y]：起点到(x,y)距离，初始-1代表未访问
int n, m;
int dx[] = {-1, 1, 0, 0};
int dy[] = {0, 0, -1, 1};

struct Node {
    int x, y;
};

int main() {
    queue<Node> q;
    cin >> n >> m;
    for(int i = 1; i <= n; i++) {
        cin >> mp[i] + 1;
    }
    // 初始化距离数组为-1
    for(int i = 1; i <= n; i++) {
        for(int j = 1; j <= m; j++) {
            dist[i][j] = -1;
        }
    }

    // 起点坐标
    int sx = 1, sy = 1;
    dist[sx][sy] = 0;
    q.push({sx, sy});

    while(!q.empty()) {
        Node u = q.front();
        q.pop();
        int x = u.x;
        int y = u.y;
        for(int i = 0; i < 4; i++) {
            int nx = x + dx[i];
            int ny = y + dy[i];
            // 不越界、未访问、不是障碍
            if(nx >= 1 && nx <= n && ny >= 1 && ny <= m && dist[nx][ny] == -1 && mp[nx][ny] != '#') {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    return 0;
}
```

### 2.2 邻接表图 BFS

```
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int MAXN = 1005;
vector<int> G[MAXN];
int dist[MAXN]; // dist[u]起点到u距离，-1代表未访问

int main() {
    queue<int> q;
    // 初始化dist数组
    for(int i = 1; i < MAXN; i++) dist[i] = -1;
    int s = 1; // 起点编号
    dist[s] = 0;
    q.push(s);

    while(!q.empty()) {
        int u = q.front();
        q.pop();
        for(int v : G[u]) {
            if(dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return 0;
}
```

## 3. 01 背包模板（每件物品只能选 1 次）

> 
> 状态定义：\(dp[j]\) 表示背包容量为 j 时，可以装下的最大价值
> 核心：容量**逆序**循环，保证同一个物品不会重复选取

```
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXW = 1005;
int dp[MAXW];
int w[MAXW], v[MAXW]; // w[]物品重量，v[]物品价值
int n, W; // n物品总数，W背包总容量

int main() {
    cin >> n >> W;
    for(int i = 1; i <= n; i++) {
        cin >> w[i] >> v[i];
    }
    // 枚举每一件物品
    for(int i = 1; i <= n; i++) {
        // 逆序枚举背包容量
        for(int j = W; j >= w[i]; j--) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    cout << dp[W] << endl;
    return 0;
}
```

## 4. 完全背包模板（每件物品可以选无限次）

> 
> 状态定义：\(dp[j]\) 表示背包容量为 j 时，可以装下的最大价值
> 核心：容量**顺序**循环，允许重复选取当前物品

```
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXW = 1005;
int dp[MAXW];
int w[MAXW], v[MAXW]; // w[]物品重量，v[]物品价值
int n, W; // n物品总数，W背包总容量

int main() {
    cin >> n >> W;
    for(int i = 1; i <= n; i++) {
        cin >> w[i] >> v[i];
    }
    // 枚举每一件物品
    for(int i = 1; i <= n; i++) {
        // 顺序枚举背包容量
        for(int j = w[i]; j <= W; j++) {
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    cout << dp[W] << endl;
    return 0;
}
```

# 模板要点总结

1. DFS：递归实现，适合搜索、回溯；⚠️递归深度过大容易栈溢出。
2. BFS：队列实现，适合求无权图最短路；天然不会栈溢出。
3. 01 背包：**逆序**遍历容量，每件物品只能选一次。
4. 完全背包：**顺序**遍历容量，每件物品无限选取。