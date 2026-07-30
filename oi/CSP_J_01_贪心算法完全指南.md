# CSP-J 专项指南：01. 贪心算法（Greedy Algorithm）

贪心算法（Greedy Algorithm）是 CSP-J（入门级）复赛中 **T2 / T3 级别的绝对高频考点**。贪心算法不依赖复杂的数据结构，但非常考验严谨的思维推导、单调性分析和找规律能力。

---

## 一、 贪心算法的核心思想

1. **局部最优 $\rightarrow$ 全局最优**：在每一步决策时，都采取当前状态下最好或最优的选择，希望通过一系列局部最优选择导出全局最优解。
2. **贪心选择性质与无后效性**：
   * **贪心选择性质**：所求问题的整体最优解可以通过一系列局部最优的选择来达到。
   * **无后效性**：某个状态以后的过程不会影响以前的状态，只与当前状态有关。
3. **证明方法（竞赛实用思想）**：
   * **反证法**：假设存在比贪心解更优的解，推出矛盾。
   * **替换法（微扰法/排序不等式）**：假设交换任意相邻两个元素的位置，证明排序后的方案不会比原方案差。

---

## 二、 CSP-J 四大高频贪心模型与代码模板

### 模型 1：区间贪心（区间重叠与覆盖问题）

#### 经典场景：选最多不重叠区间
* **策略**：按区间**右端点（结束时间）从小到大排序**。右端点越早结束，留给后面的空间越大。

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Interval {
    int l, r;
    // 按右端点升序排序
    bool operator<(const Interval& other) const {
        return r < other.r;
    }
};

int max_non_overlapping_intervals(vector<Interval>& intervals) {
    if (intervals.empty()) return 0;
    sort(intervals.begin(), intervals.end());

    int count = 1;
    int last_r = intervals[0].r;

    for (size_t i = 1; i < intervals.size(); ++i) {
        if (intervals[i].l >= last_r) { // 不重叠
            count++;
            last_r = intervals[i].r;
        }
    }
    return count;
}
```

---

### 模型 2：单调性/维护最小值贪心（如《公路》模型）

#### 经典场景：边走边维护当前历史最小值
* **策略**：从起点到终点遍历，时刻维护“当前遇到的最低价格”。在需要消费时，按已知最低价格结算。

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// 模拟 CSP-J 2023 T2 公路
long long min_cost_travel(int n, long long d, const vector<long long>& dist, const vector<long long>& price) {
    long long total_cost = 0;
    long long current_fuel = 0; // 剩余可行驶距离
    long long min_price = price[0]; // 当前遇到过的最低油价

    for (int i = 0; i < n - 1; ++i) {
        min_price = min(min_price, price[i]);
        long long need_dist = dist[i] - current_fuel;

        if (need_dist > 0) {
            // 向上取整加油量
            long long need_liters = (need_dist + d - 1) / d;
            total_cost += need_liters * min_price;
            current_fuel += need_liters * d;
        }
        current_fuel -= dist[i];
    }
    return total_cost;
}
```

---

### 模型 3：结构体多关键字排序贪心

#### 经典场景：双属性影响决策（如性价比、等待时间、损耗最小）
* **策略**：定义结构体，重载 `<` 运算符或使用自定义比较函数写明排序逻辑。

```cpp
struct Item {
    int id;
    long long weight;
    long long value;
};

// 按单位价值（性价比）降序排序
bool cmp(const Item& a, const Item& b) {
    return a.value * b.weight > b.value * a.weight; // 避免浮点数精度的乘法交叉比较
}
```

---

### 模型 4：双指针与配对贪心

#### 经典场景：大数与小数配对（如 *纪念品分组*）
* **策略**：排序后，用左指针 `L` 指向最小值，右指针 `R` 指向最大值。若 `a[L] + a[R] <= Limit`，则两人一组；否则最大值单独一组。

```cpp
int min_groups(vector<int>& w, int limit) {
    sort(w.begin(), w.end());
    int L = 0, R = w.size() - 1;
    int groups = 0;

    while (L <= R) {
        if (L == R) {
            groups++;
            break;
        }
        if (w[L] + w[R] <= limit) {
            L++;
        }
        R--;
        groups++;
    }
    return groups;
}
```

---

## 三、 CSP-J 历年贪心真题汇总

| 年份与题号 | 题目名称 | 考察点与核心策略 |
| :--- | :--- | :--- |
| **CSP-J 2023 T2** | *公路* | 单调性贪心，维护路径上的历史最低油价与向上取整加油 |
| **CSP-J 2019 T2** | *公交换乘* | 队列 + 贪心匹配，优先使用早过期且优惠面值满足条件的优惠券 |
| **NOIP 2018 普及 T2** | *龙虎斗* | 枚举 + 贪心求绝对值最小点 |
| **NOIP 2015 普及 T4** | *推销员* | 维护前缀最大距离与最大收益的单调性贪心 |
| **NOIP 2010 普及 T2** | *接水问题* | 优先队列 / 贪心模拟（每次将新接水者分配给最早空闲的水龙头） |
| **NOIP 2007 普及 T2** | *纪念品分组* | 排序 + 双指针首尾碰撞贪心 |

---

## 四、 贪心算法备考避坑 Checklist

* [ ] **盲目贪心未验证**：贪心最忌讳“凭直觉”。做题时若不确定策略，可以举反例（手算特殊样例）。若无法确定，优先考虑 DP 或搜索。
* [ ] **浮点数比较精度误差**：形如 `a.v / a.w > b.v / b.w` 的比较，务必化简为整数乘法 `a.v * b.w > b.v * a.w`。
* [ ] **整数溢出**：贪心过程中累加总收益或总花费时，变量类型务必开 `long long`。
