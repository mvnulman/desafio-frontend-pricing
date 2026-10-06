# Painel de Margem do Catálogo

Desafio Técnico Frontend — Volix.

Painel para dar visibilidade à saúde de margem de um catálogo exportado do ERP:
quais produtos geram lucro, quais operam no prejuízo e onde o resultado está
concentrado.

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # suíte de validação (Vitest)
npm run build   # build de produção
```

## Stack e bibliotecas escolhidas

| Lib | Por que |
| --- | --- |
| **Next.js 15 (App Router)** | Já vinha configurado no desafio. |
| **React 19** | Base do Next; uso de state local simples (`useState`). |
| **Material UI 9 + Emotion** | Componentes prontos e acessíveis (tabela, switch, chip, progresso) com tema próprio. Integração via `@mui/material-nextjs` (`AppRouterCacheProvider`) para evitar FOUC/duplicação de estilo no SSR. |
| **Tailwind CSS 4** | Layout e espaçamento (grid/flex/gap) de forma rápida, complementando o MUI. |
| **`Intl.NumberFormat` (nativo)** | Formatação pt-BR de moeda e percentual. Sem biblioteca externa — o requisito do desafio. |
| **Vitest** | Suíte de testes já existente no repositório. |
| **Recharts** | Vinha instalado, mas **não foi usado**: o gráfico do Top 10 foi feito com `LinearProgress` do MUI, mais leve e direto para barras comparativas. |

**Prioridade de estilos:** MUI para os componentes (comportamento, acessibilidade,
estados), Tailwind para o esqueleto da página. A lógica fica isolada em
`src/lib`, independente de UI.

## Estrutura

```
src/
  app/
    layout.jsx          # raiz + ThemeRegistry
    ThemeRegistry.jsx   # AppRouterCacheProvider + ThemeProvider + CssBaseline
    page.jsx            # árvore do painel (client component)
  lib/
    pricing.js          # parsePreco, calcularProduto, listarProdutos
    format.js           # formatCurrency, formatPercent
    pricing.test.js     # testes de validação (não alterados)
  theme.js              # tema MUI (paleta, tipografia, shape)
  data/catalago.json    # dados como vieram do ERP
```

## Regras de negócio

- **Receita mensal:** `preço × demanda`
- **Lucro mensal:** `(preço − custo) × demanda`
- **Margem (%):** `(preço − custo) / preço × 100` — sempre sobre o **preço de
  venda**, nunca sobre o custo.
- **Margem consolidada do catálogo:** `lucro total ÷ receita total`, ponderada
  pelo peso de cada produto — **nunca** a média simples das margens.

## Tratamento dos dados "sujos" do ERP (as decisões que mais importam)

O catálogo mistura formatos e valores ausentes. Decisões tomadas:

- **Preço em formato pt-BR** (`"1.299,90"`, `"249,90"`): `parsePreco` remove
  `R$`/espaços, trata `.` como separador de milhar e `,` como decimal. Números
  já limpos passam direto.
- **`custo: null` = desconhecido ≠ `custo: 0` = real.** Quando o custo é
  desconhecido, `lucro` e `margem` ficam **`null`** em vez de assumir custo zero
  e inflar o resultado. Custo zero real gera lucro = receita e margem = 100%.
- **`preço: 0`:** a receita é `0` e a margem vira `null` (evita `Infinity` por
  divisão por zero). O **lucro continua calculado** (`0 − custo × demanda`) e
  pode ser negativo.
- **Margem negativa legítima** (custo > preço) é preservada.

### `null` × `0` na interface

Valores ausentes são formatados como **`N/D`**, enquanto `0` aparece como valor
real (`R$ 0,00`, `0,00%`). Isso mantém a distinção também nos gráficos/badges.

| Produto | Preço | Custo | Margem | Receita | Lucro |
| --- | --- | --- | --- | --- | --- |
| Hub USB-C (custo `null`) | R$ 149,00 | **N/D** | **N/D** | R$ 64.070,00 | **N/D** |
| Brinde Adesivos (preço `0`) | **R$ 0,00** | R$ 2,50 | **N/D** | **R$ 0,00** | -R$ 7.500,00 |

## O que o painel contém

1. **Cards de resumo** — receita total, lucro total e margem consolidada
   (ponderada). Totais sem centavos, como na referência de layout.
   - Receita: **R$ 1.869.063** · Lucro: **R$ 843.113** · Margem: **45,11%**
2. **Top 10 · Lucro mensal** — produtos ordenados por lucro desc (custo
   desconhecido não entra no ranking), com barras proporcionais ao maior lucro.
   - Líder: **Película de Vidro — R$ 104.520**.
3. **Tabela do catálogo** — nome, preço, custo, margem %, receita e lucro, com:
   - **Busca por nome** (case-insensitive);
   - **Ordenação por margem** ao clicar no cabeçalho (alterna crescente/
     decrescente; `N/D` sempre no fim, nas duas direções);
   - **Toggle "Somente prejuízo"** (à esquerda da busca) para destacar produtos
     com `lucro < 0`.

## Decisões de implementação

- **Sem lib de state.** A página usa apenas três `useState` (busca, filtro de
  prejuízo, direção da ordenação). **Todo o resultado é derivado no render** com
  `filter`/`sort`/`map` — sem `useEffect` e sem state espelhado, o que elimina
  risco de dessincronização.
- **Cálculo separado da UI.** `pricing.js` não conhece React; `format.js` só
  formata. Facilita testar e reusar.
- **Fonte única de normalização.** `calcularProduto` normaliza as entradas
  (`precoNormalizado`, `custoNormalizado`) e devolve os indicadores; a listagem
  só espalha esse resultado, evitando duplicar parse/null-check.
- **Prejuízo é `lucro < 0`, não `margem < 0`.** Caso do Brinde Adesivos: lucro
  negativo com margem `N/D` (preço zero) — se filtrasse por margem, ele seria
  escondido indevidamente.
- **Formatação via `Intl` + valores em pontos percentuais.** `formatPercent`
  recebe `47.65` e devolve `47,65%` (dividir por 100 é exigência do
  `style: "percent"`).

## Verificação

- **Testes:** 9/9 passando (`npm test`) — os testes do repositório não foram
  alterados.
- **Build:** `npm run build` sem erros.
- **Auditoria manual dos números:** as 20 linhas foram recalculadas de forma
  independente e batem com as três fórmulas do enunciado; currency, `null` × `0`
  e Top 10 conferidos por script.

## Limitações e próximos passos

- A busca e o filtro de prejuízo atuam **somente na tabela**; cards e Top 10
  refletem o portfólio inteiro (visão de portfólio, não da seleção).
- A margem consolidada inclui prejuízos reais no numerador (perdas reduzem o
  total), conforme `lucro total ÷ receita total`.
- Possíveis evoluções: busca ignorando acentos, exportação e destaque visual para
  linhas deficitárias.
