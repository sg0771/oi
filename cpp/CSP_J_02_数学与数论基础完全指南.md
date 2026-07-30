# CSP-J 数学与数论基础完全指南

## 1. 质数与筛法
判断单个数字是否为质数的时间复杂度为 $O(\sqrt{n})$。对于大批量质数查询，需使用筛法。

### 1.1 埃拉托斯特尼筛法 (Sieve of Eratosthenes)
时间复杂度 $O(N \log \log N)$。
```cpp
const int N = 1000005;
bool is_prime[N];
void eratosthenes(int n) {
    std::fill(is_prime, is_prime + n + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i * i <= n; i++) {
        if (is_prime[i]) {
            for (int j = i * i; j <= n; j += i)
                is_prime[j] = false;
        }
    }
}
```

### 1.2 欧拉筛法 (线性筛)
时间复杂度 $O(N)$，利用每个合数只被其最小质因子筛掉的性质。

## 2. 最大公约数 (GCD) 与 最小公倍数 (LCM)
辗转相除法（欧几里得算法）：
```cpp
int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}
// LCM = a / gcd(a, b) * b; // 防溢出写法
```

## 3. 快速幂算法
在 $O(\log b)$ 时间内计算 $a^b \pmod m$。
```cpp
long long fast_pow(long long a, long long b, long long m) {
    long long res = 1;
    a %= m;
    while (b > 0) {
        if (b & 1) res = res * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return res;
}
```
