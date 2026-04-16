# VS1984 NextJS Demo

***现阶段, 只支持ubuntu24.04***

## Ubuntu24.04 环境中, 简单运行命令即可尝试:
```bash
npm install && npm run start
```
## 在 Docker 环境中尝试:
### Linux:
```bash
 docker compose -f docker-compose.linux.yml up -d --build
```
### MacOS:
```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```
### Windows:
#### [配置Docker Desktop](Docker-windows.zh-CN.md)

```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```

# VS1984 ai srv概览

[English](README.md) | [中文](README.zh-CN.md)

## 概述

本项目是基于 **VS1984 网络** 构建的一个 **去中心化 RAG（Retrieval-Augmented Generation）服务示例**。

它展示了一种全新的 AI 架构：

> **在不移动、不暴露数据的前提下，让 AI 使用分布在不同节点上的私有知识完成推理。**

与传统 RAG 系统不同（依赖中心化向量数据库），本系统：

* 数据始终保留在 **Provider 节点本地**
* 查询通过 **Indexer 服务进行发现与路由**
* AI 推理在数据拥有者节点本地完成
* 仅返回结果，而非原始数据

---

### 🧠 系统核心能力

该 RAG 服务实现了以下关键能力：

* **分布式数据检索（Decentralized Retrieval）**
  在 P2P 网络中定位最相关的数据源，而非集中数据库

* **隐私保护推理（Privacy-Preserving Inference）**
  数据不出本地，AI 计算在数据拥有方执行

* **智能路由（Query Routing）**
  通过 Indexer 选择最合适的 Provider 节点

* **可验证的质量排序（QScore）**
  基于链上行为对数据源质量进行评分与排序

* **内置经济机制（可扩展）**
  查询节点可通过链上 credit 支付数据使用费用

---

### 🚀 解决的问题

传统 RAG 面临几个核心问题：

* ❌ 数据必须集中存储（隐私风险）
* ❌ 企业无法使用敏感数据
* ❌ 数据所有者无法获得收益
* ❌ 系统存在单点控制与审查风险

VS1984 RAG Service 提供的解决方案：

* ✔ 数据 **不出本地**
* ✔ AI **跨节点协作**
* ✔ 知识 **可交易**
* ✔ 系统 **无中心控制**

---

### 🧩 在整体架构中的位置

该服务由三类节点协同完成：

* **Provider**：持有数据并执行本地 RAG
* **Indexer**：负责数据发现与排序（本项目）
* **Query Node**：发起查询并获取结果

---

### 🌐 一句话总结

> VS1984 RAG Service 是一个让 AI 可以“在不触碰数据的情况下使用数据”的去中心化知识网络。

---

## 初次运行
```text
生成证书 
cmd cert <passwd>
重启后
cmd register
注册后
cmd bind provider
即可将此VS1984节点注册为provider节点
```

# VS1984 概览

**VS1984** 是一个 **去中心化的匿名通信与内容共享网络**。

它旨在为创作者和普通用户提供一个可自部署、匿名且抗审查的基础设施——在这个逐渐变得像 *《1984》* 的世界里，仍然能自由沟通与分享内容。

## 核心目标

* **去中心化** —— 无中心服务器。内容通过 P2P 网络在节点间直接传播。
* **匿名性与隐私** —— 采用双身份模型（Guard ID / Real ID），在协议层面将路由身份与结算身份彻底分离。
* **端到端加密** —— 内容默认加密，只有持有相应密钥的双方才能解密。
* **抗审查能力** —— 多跳路由、链上证明与分布式节点，使得内容下架更困难、更透明。

## 为什么是 VS1984？

因为这个世界需要一种无需依赖服务器、却能同时提供 **完整加密通信 + 匿名内容发布 + 匿名交易** 的系统。

**VS1984** 专为以下场景设计：

* ✔ 匿名聊天
* ✔ 匿名语音通话
* ✔ 无法追踪不可审查的内容发布
* ✔ 付费 BT 内容平台
* ✔ 全球分布式的安全通信网络
* ✔ 国家级审查无法触及的加密生态

当传统平台关闭、审查升级、通信受限时，VS1984 仍然可以继续运行。
