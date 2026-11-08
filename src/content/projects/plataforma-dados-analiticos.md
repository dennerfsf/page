---
title: "Plataforma de dados analíticos (exemplo)"
summary: "Projeto demonstrativo de uma plataforma analítica em camadas, com ingestão automatizada, modelagem e painéis de BI."
category: "Engenharia de Dados"
extraCategories: ["Business Intelligence"]
technologies: ["BigQuery", "SQL", "Python", "Metabase", "CI/CD"]
status: "concluido"
date: "2025-03-01"
endDate: "2025-11-01"
visibility: "public"
role: "Arquitetura e engenharia de dados"
featured: true
demo: true
---

## Contexto e problema

Descreva aqui o cenário real: quais áreas consumiam os dados, como eram as cargas antes do projeto e quais dores motivaram a iniciativa (por exemplo, relatórios manuais, divergência entre números ou lentidão nas consultas).

## Objetivos

- Centralizar fontes de dados em um repositório analítico confiável;
- Padronizar regras de negócio em uma camada semântica;
- Disponibilizar painéis de autoatendimento.

## Arquitetura da solução

```mermaid
flowchart LR
  A[Sistemas de origem] --> B[Ingestão]
  B --> C[(Camada bruta)]
  C --> D[(Camada tratada)]
  D --> E[(Camada analítica)]
  E --> F[Painéis de BI]
```

## Resultados

Registre aqui apenas resultados reais e autorizados para divulgação — preferencialmente com indicadores verificáveis.
