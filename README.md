# VS1984 NextJS Demo

## Preparing the Model:

Go to Hugging Face (search for gemma-3-1b-it-Q4_K_M.gguf; other models require you to configure vshome/cnf/config.xbc). Common repositories are *-GGUF repositories (such as bartowski/... or unsloth/...).

Download to your local machine: ./models

```

## In Ubuntu24.04 you can simply run:
```bash
npm install && npm run start
```
## Run demo in docker:
### Linux:
```bash
 docker compose -f docker-compose.linux.yml up -d --build
```
### MacOS:
```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```
### Windows:
#### [Configure Docker Desktop](Docker-windows.md)

```bash
 docker compose -f docker-compose.desktop.yml up -d --build
```

# VS1984 rag service Overview

[English](README.md) | [中文](README.zh-CN.md)

## Overview

This project is a **decentralized RAG (Retrieval-Augmented Generation) service example** built on the **VS1984 network**.

It demonstrates a novel AI architecture:

> **Allowing AI to perform inference using private knowledge distributed across different nodes without moving or exposing data.** **
** Unlike traditional RAG systems (which rely on centralized vector databases), this system:

* Data is always stored locally on the **Provider node**

* Queries are discovered and routed via the **Indexer service**

* AI inference is performed locally on the data owner node

* Only results are returned, not the original data

---

### 🧠 Core System Capabilities

This RAG service implements the following key capabilities:

* **Decentralized Retrieval**

Locates the most relevant data source in a P2P network, rather than a centralized database.

* **Privacy-Preserving Inference**

Data remains local; AI computation is performed on the data owner.

* **Query Routing**
  Selects the most suitable Provider node via the Indexer.

* **Verifiable Quality Ranking (QScore)**
  Scores and ranks data source quality based on on-chain behavior.

* **Built-in Economic Mechanism (Scalable)**

Query nodes can use on-chain credits... Paying for Data Usage

---

### 🚀 Problems Solved

Traditional RAGs face several core problems:

* ❌ Data must be centrally stored (privacy risks)

* ❌ Enterprises cannot use sensitive data

* ❌ Data owners cannot receive benefits

* ❌ The system has single-point control and censorship risks

VS1984 RAG Service provides the following solutions:

* ✔ Data **does not leave local storage**

* ✔ AI **cross-node collaboration**

* ✔ Knowledge **is tradable**

* ✔ The system **has no centralized control**

---

### 🧩 Position in the Overall Architecture

This service is completed collaboratively by three types of nodes:

* **Provider**: Holds data and executes the local RAG

* **Indexer**: Responsible for data discovery and sorting (in this project)

* **Query Node**: Initiates queries and retrieves results

---

### 🌐 One-sentence summary

> VS1984 RAG Service is a decentralized knowledge network that allows AI to "use data without touching it."

---

## Configuration

```text

In the config.xbc configuration file:

"rag": {"indexer": true, "model": "models/gemma-3-1b-it-Q4_K_M.gguf", "rag_path" : "."},

"indexer": true indicates that this node is an Indexer node.

"model": "model_path" is the path to your local LLM model.

"rag_path": "." indicates the path to the rag subroutine.

You can add -dd when starting the program to view more detailed logs. Refer to the VS1984 documentation for details.

```

## First Run

```text Generate Certificate

cmd cert <passwd> After Restart

cmd register After Registration

cmd bind provider This will register this VS1984 node as a provider node.

```

## Overview

**VS1984** is a **Decentralized Anonymous Communication & Content Sharing Network**.

It aims to provide a self-hostable, anonymous and censorship-resistant
infrastructure for creators and everyday users, in a world that often feels
increasingly like *1984*.

## Core Goals

- **Decentralization** – No central server. Content propagates directly between
peers over a P2P network.
- **Anonymity & Privacy** – A dual identity model (Guard ID / Real ID) that
separates routing identity from settlement identity at the protocol level.
- **End-to-End Encryption** – Content is encrypted by default. Only parties
holding the proper keys can decrypt it.
- **Censorship Resistance** – Multi-hop routing, on-chain proofs and
distributed nodes make takedowns harder and more visible.

## Why VS1984?
Because the world needs a system that does not rely on servers but still provides complete encrypted communication + anonymous content publishing + anonymous transactions.

**VS1984** is designed for scenarios such as:

- ✔ Anonymous chat
- ✔ Anonymous voice calls
- ✔ Uncensorable Untraceable content publishing
- ✔ Paid BT content platforms
- ✔ A globally distributed, secure communication network
- ✔ An encrypted ecosystem beyond the reach of nation-state censors
When traditional platforms shut down, censorship rises, and communication is restricted, VS1984 can still operate.
