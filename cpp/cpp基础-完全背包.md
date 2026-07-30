# 完全背包问题

有 100 元，纪念品 1 单价 6 元第二天赚 2 元，纪念品 2 单价 7 元第二天赚 5 元

## 一、状态定义 & 转移方程1. 变量说明总本金：100 元

* 物品 1：单价 w<sub>1</sub>=6，单件利润 v<sub>1</sub>=2

* 物品 2：单价 w<sub>2</sub>=7，单件利润 v<sub>2</sub>=5

* dp[j]：花费 j 元购买纪念品，能得到的最大利润2. 状态转移（完全背包，可无限买）

### 通用式：

* dp[j] = max(dp[j], dp[j-w] + v)分开写两件物品：

* 纪念品 1： dp[j] = max(dp[j], dp[j-6] + 2) 

* 纪念品 2：dp[j] = max(dp[j], dp[j-7] + 5)  

遍历规则完全背包：钱数 j 从小到大循环。

## 二、完整 C++ 代码
~~~cpp
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

const int MAX_MONEY = 100;
int dp[MAX_MONEY + 1];

int main()
{
    // 初始化dp全部为0，不花钱利润为0
    memset(dp, 0, sizeof(dp));

    // 物品1：w=6, v=2
    int w1 = 6, v1 = 2;
    for (int j = w1; j <= MAX_MONEY; j++)
    {
        dp[j] = max(dp[j], dp[j - w1] + v1);
    }

    // 物品2：w=7, v=5
    int w2 = 7, v2 = 5;
    for (int j = w2; j <= MAX_MONEY; j++)
    {
        dp[j] = max(dp[j], dp[j - w2] + v2);
    }

    // 找出0~100元中最大利润
    int max_profit = 0;
    for (int j = 0; j <= MAX_MONEY; j++)
    {
        max_profit = max(max_profit, dp[j]);
    }

    cout << "最大利润：" << max_profit << endl;
    cout << "最终总钱数：" << 100 + max_profit << endl;
    return 0;
}
~~~


## 三、代码逻辑说明

* dp 数组下标代表花多少钱，值代表能赚多少利润；

* 先处理每件物品，钱从小到大循环，允许重复购买（完全背包核心）；

* 最后遍历全部金额，取最大利润，本金加上利润就是第二天总钱；

* 对应 CSP-J2019 T3 纪念品标准写法。