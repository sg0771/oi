# CSP-J STL容器与数据结构指南

## 1. std::vector (动态数组)
- **底层机制**：连续内存空间，空间不足时成倍扩容。
- **复杂度**：随机访问 $O(1)$，尾部插入 $O(1)$ 均摊。
- **常用API**：`push_back()`, `pop_back()`, `resize()`, `clear()`

## 2. std::string (字符串)
高度封装的字符数组，支持各类拼接和查找。
- `substr(pos, len)`: 提取子串。
- `find(str)`: 查找子串出现位置，找不到返回 `std::string::npos`。

## 3. std::queue / std::deque (队列 / 双端队列)
- **queue**：先进先出 (FIFO)。用于 BFS (广度优先搜索)。
  - `push()`, `pop()`, `front()`, `empty()`
- **deque**：支持头尾双端的高效插入与删除。常用于单调队列优化。

## 4. std::priority_queue (优先队列 / 堆)
默认大根堆。如果需要小根堆：
```cpp
#include <queue>
#include <vector>
// 小根堆声明
std::priority_queue<int, std::vector<int>, std::greater<int>> min_heap;
```
常用于：Dijkstra 算法优化、贪心（合并果子）。

## 5. std::set / std::map (红黑树)
- **特点**：元素有序，内部实现为红黑树。
- **复杂度**：插入、删除、查找均为 $O(\log N)$。
- **map**：键值对映射，非常适合做离散化和频次统计。如果对顺序无要求且追求极致速度，可考虑 `std::unordered_map` (哈希表, $O(1)$)。
