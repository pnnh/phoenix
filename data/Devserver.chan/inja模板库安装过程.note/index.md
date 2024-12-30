---
image: cover.jpg
---

安装过程

```bash
git clone https://github.com/pantor/inja.git
cd inja
git checkout v3.4.0  # 安装指定版本
mkdir build && cd build
# 安装到/opt目录，启用部分构建选项
cmake -DCMAKE_INSTALL_PREFIX=/opt -DBUILD_TESTING=OFF -DINJA_BUILD_TESTS=OFF -DBUILD_BENCHMARK=OFF -DCOVERALLS=OFF ..  
sudo ninja install
```