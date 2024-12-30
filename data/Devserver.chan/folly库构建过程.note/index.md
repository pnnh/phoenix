---
image: cover.jpg
---

构建过程

系统	ubuntu 23.10 
时间	2024-03-26 16:51:05

```bash
cd ~/Library
git clone https://github.com/facebook/folly.git
cd folly
git checkout v2024.03.25.00
sudo ./build/fbcode_builder/getdeps.py install-system-deps --recursive
mkdir _build && cd _build
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/opt ..
ninja
sudo ninja install
```
