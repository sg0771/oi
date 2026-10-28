# T4 木雕玩具 (toy) 题解

## 1. 题目分析

### 题意简述
工作室共有 3 位手艺精湛的木雕师傅。
有 $n$ 个人来到工作室，第 $i$ 个人想要的玩具图案编号为一个整数 $a_i$。
每位雕刻师事先选定一个图案 $y \in [1, 10^9]$。如果由这位雕刻师制作图案 $a_i$ 的玩具，所需花费的制作等待时间为 $|a_i - y|$。
雕刻师们可以同时为不同的人制作，互不干扰。
问：如何安排 3 位雕刻师的基准图案 $y_1, y_2, y_3$，使得**所有顾客的最大等待时间尽可能小**？请求出该最小的最大等待时间。

### 数据范围
- 对于 $30\%$ 的数据：$1 \le n \le 10$，$1 \le a_i \le 100$。
- 对于 $70\%$ 的数据：$1 \le n \le 2000$。
- 对于 $100\%$ 的数据：$1 \le n \le 2 \times 10^5$，$1 \le a_i \le 10^9$。

---

## 2. 解题思路

### 2.1 转化求“最大值最小”为判定问题
看到“使最大等待时间尽可能小”，可以立即联想到**二分答案**。
假设当前二分测试的最大等待时间为 $T$：
如果一位师傅选定了图案 $y$，那么所有满足 $|a_i - y| \le T$ 的顾客都可以交由他负责。
解绝对值不等式：
$$ y - T \le a_i \le y + T \iff a_i \in [y - T, y + T] $$
该区间的长度最大为 $(y + T) - (y - T) = 2T$。
换句话说，**每位雕刻师最多可以覆盖一个长度为 $2T$ 的连续值域闭区间**。

现在工作室有 3 位雕刻师，问题等价于：
> **能否用 3 个长度不超过 $2T$ 的闭区间覆盖所有的目标数值 $\{a_1, a_2, \dots, a_n\}$？**

### 2.2 贪心覆盖判定（Check 函数）
先将所有的 $a_i$ 升序排序：
1. 第 1 位师傅的区间左端点应当紧贴未被覆盖的最小值 $a_1$，即该区间为 $[a_1, a_1 + 2T]$。
   利用双指针或线性扫描，跳过所有落在该区间内的数，找到第 1 个大于 $a_1 + 2T$ 的元素 $a_{i_1}$。
2. 若已覆盖所有数，说明成功；否则第 2 位师傅的区间左端点紧贴 $a_{i_1}$，区间为 $[a_{i_1}, a_{i_1} + 2T]$。
   同样找到第 1 个大于 $a_{i_1} + 2T$ 的元素 $a_{i_2}$。
3. 若已覆盖所有数，说明成功；否则第 3 位师傅的区间覆盖 $[a_{i_2}, a_{i_2} + 2T]$。
4. 检查是否所有的数都已经被上述 3 个区间覆盖完毕。如果覆盖完毕，则返回 `true`，否则返回 `false`。

### 2.3 二分边界
- 下界 $L = 0$（当数值种数 $\le 3$ 时，最大等待时间可以为 0）；
- 上界 $R = 10^9$（因为 $a_i \le 10^9$）。
二分次数仅需 $\log_2(10^9) \approx 30$ 次。

---

## 3. 复杂度分析

- **时间复杂度**：
  - 排序耗时 $\mathcal{O}(n \log n)$；
  - 二分查找进行 $\approx 31$ 次，每次贪心验证耗时 $\mathcal{O}(n)$，验证部分总耗时 $\mathcal{O}(n \log(\max A))$。
  - 对于 $n = 2 \times 10^5$，总体运行时间在 $0.06\text{s}$ 以内。
- **空间复杂度**：
  - 仅需保存顾客图案数组 $a$，空间复杂度为 $\mathcal{O}(n)$。

---

## 4. 完整代码（附详细注释）

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// 验证最大等待时间为 T 时，能否使用 3 个长度为 2T 的区间覆盖所有图案
bool check(long long T, const vector<long long>& a) {
    int n = a.size();
    int used_sculptors = 0; // 已使用的雕刻师数量
    int idx = 0;            // 当前待覆盖的最小元素下标

    while (idx < n) {
        used_sculptors++;
        // 如果超过 3 位雕刻师仍未覆盖完毕，则说明 T 过小
        if (used_sculptors > 3) {
            return false;
        }

        // 当前雕刻师从 a[idx] 开始覆盖，区间为 [a[idx], a[idx] + 2 * T]
        long long max_cover = a[idx] + 2 * T;

        // 跳过所有能被当前雕刻师顺带完成的玩具图案
        while (idx < n && a[idx] <= max_cover) {
            idx++;
        }
    }

    return true;
}

int main() {
    // 提升 I/O 速度
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    // 将玩具图案按需求数值从小到大排序
    sort(a.begin(), a.end());

    // 二分答案
    long long left = 0, right = 1e9;
    long long ans = right;

    while (left <= right) {
        long long mid = left + (right - left) / 2;
        if (check(mid, a)) {
            ans = mid;         // 当前时间可行，记录答案并尝试寻找更小等待时间
            right = mid - 1;
        } else {
            left = mid + 1;    // 不可行，需要增大等待时间
        }
    }

    cout << ans << "\n";

    return 0;
}
```