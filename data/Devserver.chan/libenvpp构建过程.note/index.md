---
image: cover.jpg
---

安装过程

```bash
git clone https://github.com/ph3at/libenvpp.git
cd libenvpp
git checkout v1.4.0
mkdir _build && cd _build
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/opt -DLIBENVPP_TESTS=OFF -DLIBENVPP_EXAMPLES=OFF -DLIBENVPP_INSTALL=ON ..
ninja
sudo ninja install
```