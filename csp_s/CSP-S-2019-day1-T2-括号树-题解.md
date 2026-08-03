# P5658 [CSP-S 2019] 括号树 题解

## 题目大意

给定一棵以 1 为根的树，每个结点上有一个括号 `(` 或 `)`。定义 $s_i$ 为根到结点 $i$ 路径上的括号组成的字符串。对每个 $i$，求 $s_i$ 中合法括号子串的个数 $k_i$，最终输出 $\bigoplus_{i=1}^{n} (i \times k_i)$。

---

## 解题思路

### 核心观察

由于 $s_i$ 是 $s_{f_i}$（父结点路径串）末尾追加一个括号，合法括号子串个数可以增量维护。

定义 $f[i]$ 表示以结点 $i$ 为结尾的合法括号子串个数，$k[i]$ 表示 $s_i$ 中所有合法括号子串总数，则：

$$k[i] = k[f_i] + f[i]$$

### 用栈匹配括号

维护一个栈，存储路径上未匹配的 `(` 所在的结点编号：

- **当前结点 $i$ 是 `(`**：入栈，$f[i] = 0$，$k[i] = k[f_i]$。
- **当前结点 $i$ 是 `)` 且栈非空**：弹出栈顶结点 $j$（即与 $i$ 配对的 `(`）。以 $i$ 结尾的合法子串包括：配对 $[j, i]$ 本身，以及 $j$ 之前那段路径末尾的合法子串再接上 $[j, i]$。因此：

$$f[i] = f[\text{fa}[j]] + 1$$

其中 $\text{fa}[j]$ 是 $j$ 的树父（路径上 $j$ 的前驱），$\text{fa}[\text{root}] = 0$，$f[0] = 0$。

$$k[i] = k[f_i] + f[i]$$

- **当前结点 $i$ 是 `)` 且栈为空**：无法匹配，$f[i] = 0$，$k[i] = k[f_i]$。

### DFS 回溯

由于是树形结构，用 DFS 遍历，进入结点时修改栈，回溯时恢复栈状态（`(` 弹出自身，`)` 将弹出的 $j$ 重新压栈）。

---

## C++ 源代码

```cpp
#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 500005;
int n;
char bracket[MAXN];
int fa[MAXN];
long long f[MAXN], k[MAXN];
int stk[MAXN], top;
vector<int> children[MAXN];

void dfs(int u) {
    if (bracket[u] == '(') {
        stk[top++] = u;
        f[u] = 0;
        k[u] = k[fa[u]];
    } else {
        if (top > 0) {
            int j = stk[--top];
            f[u] = f[fa[j]] + 1;
            k[u] = k[fa[u]] + f[u];
            for (int v : children[u]) dfs(v);
            stk[top++] = j;  // 回溯恢复
            return;
        } else {
            f[u] = 0;
            k[u] = k[fa[u]];
        }
    }
    for (int v : children[u]) dfs(v);
    if (bracket[u] == '(') top--;  // 回溯恢复
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> (bracket + 1);
    for (int i = 2; i <= n; ++i) {
        cin >> fa[i];
        children[fa[i]].push_back(i);
    }
    fa[1] = 0;
    f[0] = k[0] = 0;

    dfs(1);

    long long ans = 0;
    for (int i = 1; i <= n; ++i) {
        ans ^= (1LL * i * k[i]);
    }
    cout << ans << "\n";

    return 0;
}
```

---

## 复杂度分析

- **时间复杂度**：$\mathcal{O}(n)$，每个结点访问一次，栈操作均摊 $\mathcal{O}(1)$。
- **空间复杂度**：$\mathcal{O}(n)$，用于存储树结构、栈和 DP 数组。

---

## 关键点

1. **增量维护**：利用 $s_i = s_{f_i} + \text{bracket}[i]$ 的性质，将问题转化为增量计算 $f[i]$。
2. **栈的回溯**：DFS 进入时修改栈，回溯时恢复，保证栈始终反映当前路径状态。
3. **递归深度**：$n$ 最大 $5 \times 10^5$，可能需要手动开大栈空间或改用迭代式 DFS。
