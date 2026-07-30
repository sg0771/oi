# CSP-J 二分查找与分治算法指南

## 1. 二分查找核心原理
二分查找的核心是**单调性**。只要问题的解域具有单调性，或者满足某种 "0/1 边界" 特性，即可使用二分。时间复杂度为 $O(\log N)$。

## 2. 整数二分的模板与死循环避免
二分最头疼的是 `l` 和 `r` 的更新方式导致的死循环。

### 模板 1：查找满足条件的第一个位置 (如 >= x 的第一个位置)
```cpp
int l = 0, r = n - 1;
while (l < r) {
    int mid = l + (r - l) / 2;
    if (check(mid)) r = mid; // 答案在左半边包含 mid
    else l = mid + 1;
}
```

### 模板 2：查找满足条件的最后一个位置 (如 <= x 的最后一个位置)
```cpp
int l = 0, r = n - 1;
while (l < r) {
    int mid = l + (r - l + 1) / 2; // 注意向上取整，避免死循环！
    if (check(mid)) l = mid; 
    else r = mid - 1;
}
```

## 3. 二分答案 (Bisection Method for Optimization)
遇到“最大值最小化”或“最小值最大化”的问题，通常是二分答案的标志。
将求解问题转化为判定问题：判断给定一个候选答案 `mid` 时，是否能满足题目条件。

## 4. 分治 (Divide and Conquer)
将大问题拆分为同结构的子问题，递归求解并合并。
**经典应用**：归并排序及其扩展（求逆序对）。
```cpp
// 逆序对统计合并逻辑
int i = l, j = mid + 1, k = l;
long long inv_count = 0;
while (i <= mid && j <= r) {
    if (a[i] <= a[j]) tmp[k++] = a[i++];
    else {
        tmp[k++] = a[j++];
        inv_count += (mid - i + 1); // 核心统计逻辑
    }
}
```
