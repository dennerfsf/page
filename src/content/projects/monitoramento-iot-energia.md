---
title: "Monitoramento IoT de consumo de energia (exemplo)"
summary: "Projeto demonstrativo que une Engenharia Elétrica e dados: sensores medem o consumo e enviam leituras para análise em tempo quase real."
category: "IoT e Sistemas Embarcados"
extraCategories: ["Pesquisa Científica"]
technologies: ["Sistemas embarcados", "MQTT", "Python", "PostgreSQL", "Linux"]
status: "conceito"
date: "2023-08-01"
visibility: "public"
role: "Pesquisa e prototipagem"
featured: false
demo: true
---

## Contexto e problema

Exemplo: medir o consumo de energia de equipamentos para identificar desperdícios e apoiar decisões de eficiência energética.

## Objetivos

- Coletar leituras de corrente e tensão com microcontroladores;
- Transmitir os dados por um protocolo leve (MQTT);
- Armazenar e visualizar séries temporais.

## Arquitetura

```mermaid
flowchart LR
  S[Sensores] --> M[Microcontrolador]
  M -- MQTT --> B[Broker]
  B --> I[Serviço de ingestão]
  I --> D[(PostgreSQL)]
  D --> V[Painel]
```

## Resultados

Projeto conceitual de demonstração. Substitua por um projeto real ou remova este arquivo.
