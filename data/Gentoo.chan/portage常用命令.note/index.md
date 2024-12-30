---
image: cover.jpg
---

官方包仓库地址
https://packages.gentoo.org/

```bash
# 查找包
emerge --search <package-name>
# 安装包
emerge <package-name>
emerge --ask <package-name>
# 更新包
emerge --sync
# 卸载包
emerge --unmerge <package-name>
```

### equery使用

equery是gentoo提供的一个查询包信息的工具，可以查询包的依赖关系、文件列表等信息。

需要先安装gentoolkit包

```bash
emerge --ask app-portage/gentoolkit
```

```bash
# 查看已安装的包信息，支持*通配符
equery list bash-*
```