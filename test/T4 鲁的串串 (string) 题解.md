# T4 鲁的串串 (string) 题解

## 1. 题目分析

### 题目大意
- 给定字母表大小为 $k$（字符集为前 $k$ 个小写字母），原字符串 $S$ 的长度为 $n$。
- 允许在 $S$ 的末尾添加 $m$ 个符文（字符集同样来自前 $k$ 个小写字母），构成一个总长度为 $n + m$ 的新字符串 $T$。
- 问：如何添加这 $m$ 个字符，能使得 $T$ 的**不同子序列个数**最多？
- 输出最多的不同子序列数量对 $10^9 + 7$ 取模后的值。

### 数据范围
- $k \le 26$
- $n, m \le 10^5$

---

## 2. 算法原理与推导

### 2.1 统计不同子序列的经典 DP
对于给定确定的字符串 $T$，计算其本质不同子序列的标准 DP 过程如下：
定义 $dp[i]$ 为前 $i$ 个字符能构成的不同子序列个数（通常计入空串，最终答案减 $1$ 或视题意包含空串）：
$$dp[i] = 2 \cdot dp[i-1] - dp[last[T_i] - 1]$$
其中 $last[c]$ 表示字符 $c$ 在此前最后一次出现的下标。

等价地，我们可以用**以字符 $c$ 结尾的子序列数**来维护：
- 令 $f(c)$ 表示以字符 $c$ 结尾的互不相同的子序列数目。
- 当在末尾追加一个字符 $x$ 时：
  新产生的以 $x$ 结尾的子序列，可以在此前**所有已有的子序列**（包括空序列）后拼接 $x$。
  因此，追加字符 $x$ 后的更新规则为：
  $$f_{new}(x) = 1 + \sum_{c} f(c)$$
  其余字符 $c \ne x$ 的 $f(c)$ 保持不变。
- 整个序列的不同非空子序列总数为：
  $$\sum_{c} f(c)$$

### 2.2 贪心选择添加的字符
观察每次在末尾追加字符 $x$ 时的增量：
- 追加前所有字符状态和为 $Sum = \sum_c f(c)$。
- 追加 $x$ 后，新的总和为：
  $$Sum_{new} = Sum - f(x) + f_{new}(x) = Sum - f(x) + (1 + Sum) = 2 \cdot Sum + 1 - f(x)$$
- 为了最大化 $Sum_{new}$，必须**最小化 $f(x)$**！
- 换言之，每次追加字符时，我们必须贪心地选择当前 $f(c)$ **最小**的那个字符。

### 2.3 维护与优化
1. **处理原字符串的前 $n$ 个字符**：
   - 依次遍历原字符串中的每个字符 $S_i$，按照 $f(S_i) = 1 + \sum_{c} f(c)$ 更新。
2. **处理后续追加的 $m$ 个字符**：
   - 每次贪心选取当前值最小的 $f(c)$ 进行替换更新。
   - 注意到一个重要性质：被更新的字符其新值 $f_{new}(x) = 1 + Sum$ 必然成为当前所有字符中**最大**的值。
   - 因此，原先的 $k$ 个字符的相对大小顺序在更新后保持轮换关系：
     最小的元素被更新为最大，原来的第二小成为最小……
     这意味着最优策略必然是**循环轮流选择当前最小的字符**！
   - 维护一个大小为 $k$ 的小根堆（或单调队列/直接模拟循环队列），模拟 $m$ 步追加即可。
   - 由于每次都是取最老未更新的那个字符，直接使用 FIFO 队列或者简单指针循环即可在 $O(m + n)$ 线性时间内完成计算。

---

## 3. 参考代码与详细注释

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <queue>

using namespace std;

const int MOD = 1000000007;

int main() {
    // 提高 I/O 效率
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int m, k;
    if (!(cin >> m >> k)) return 0;

    string s;
    cin >> s;

    // f[c] 表示以字符 c 结尾的不同子序列数目
    // 字符范围为前 k 个小写字母，下标 0 ~ k-1
    vector<long long> f(k, 0);
    long long total_sum = 0; // 当前 sum(f[c]) % MOD

    // 1. 处理原有的字符串 s
    for (char ch : s) {
        int c = ch - 'a';
        long long new_fc = (total_sum + 1) % MOD;
        // 增量为 (new_fc - f[c])
        total_sum = (total_sum - f[c] + new_fc) % MOD;
        if (total_sum < 0) total_sum += MOD;
        f[c] = new_fc;
    }

    // 2. 为了每次选择 f 值最小的字符，使用小根堆维护 (f[c], c)
    // 对于 m <= 10^5, 使用优先队列完全能在时限内通过
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < k; ++i) {
        pq.push(f[i]);
    }

    // 3. 贪心追加 m 个字符
    for (int i = 0; i < m; ++i) {
        long long min_val = pq.top();
        pq.pop();

        long long new_val = (total_sum + 1) % MOD;
        total_sum = (total_sum - min_val + new_val) % MOD;
        if (total_sum < 0) total_sum += MOD;

        pq.push(new_val);
    }

    // total_sum 即为所有非空不同子序列的数量
    cout << total_sum << "\n";

    return 0;
}
```