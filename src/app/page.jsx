"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import catalogo from "@/data/catalago.json";
import { listarProdutos } from "@/lib/pricing";
import { formatCurrency, formatPercent } from "@/lib/format";

// Calculado uma vez fora do componente — não precisa virar state.
const produtos = listarProdutos(catalogo);

// Resumo do portfólio (ponderado pelo peso de cada produto).
const receitaTotal = produtos.reduce((soma, p) => soma + p.receita, 0);
const lucroTotal = produtos.reduce((soma, p) => soma + (p.lucro ?? 0), 0);
const margemConsolidada = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : null;

// Top 10 por lucro mensal (sem custo conhecido não há lucro para ranquear).
const top10 = [...produtos]
  .filter((p) => p.lucro != null)
  .sort((a, b) => b.lucro - a.lucro)
  .slice(0, 10);
const maiorLucro = top10[0]?.lucro ?? 0;

const celulaCabecalho = {
  textTransform: "uppercase",
  fontSize: 12,
  letterSpacing: "0.04em",
  fontWeight: 600,
  color: "text.secondary",
};

const numerosTabulados = { fontVariantNumeric: "tabular-nums" };

function ResumoCard({ titulo, valor, nota, destaque = false }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {titulo}
        </Typography>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mt: 0.5,
            ...numerosTabulados,
            color: destaque ? "success.main" : "text.primary",
          }}
        >
          {valor}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {nota}
        </Typography>
      </CardContent>
    </Card>
  );
}

function MargemChip({ margem }) {
  const estilo =
    margem == null
      ? { bgcolor: "grey.100", color: "text.secondary" }
      : margem < 0
        ? { bgcolor: "#fee2e2", color: "#b91c1c" }
        : margem < 20
          ? { bgcolor: "#fef3c7", color: "#b45309" }
          : { bgcolor: "#d1fae5", color: "#047857" };

  return (
    <Chip
      size="small"
      label={formatPercent(margem)}
      sx={{ fontWeight: 600, ...numerosTabulados, ...estilo }}
    />
  );
}

export default function Home() {
  // States da busca (texto), do filtro de prejuízo e da ordenação por margem.
  const [busca, setBusca] = useState("");
  const [apenasPrejuizo, setApenasPrejuizo] = useState(false);
  const [ordemMargem, setOrdemMargem] = useState("desc");

  // Resultado derivado no próprio render — sem useEffect e sem state extra.
  const termo = busca.trim().toLowerCase();
  const produtosFiltrados = produtos.filter((produto) => {
    // Lucro negativo = prejuízo (custo null não é prejuízo, é desconhecido).
    if (apenasPrejuizo && !(produto.lucro != null && produto.lucro < 0)) return false;
    if (termo && !produto.nome.toLowerCase().includes(termo)) return false;
    return true;
  });

  // margem null sempre no final, seja crescente ou decrescente.
  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (a.margem == null && b.margem == null) return 0;
    if (a.margem == null) return 1;
    if (b.margem == null) return -1;
    return ordemMargem === "asc" ? a.margem - b.margem : b.margem - a.margem;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box
        component="header"
        className="mb-6 flex flex-wrap items-start justify-between gap-4"
      >
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.01em">
            Painel de Margem do Catálogo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saúde de margem do portfólio · {produtos.length} produtos · dados do ERP
          </Typography>
        </Box>
        <Chip label="catalogo.json" variant="outlined" size="small" />
      </Box>

      {/* Cards de resumo */}
      <Box component="section" className="mb-6 grid gap-4 sm:grid-cols-3">
        <ResumoCard
          titulo="Receita mensal total"
          valor={formatCurrency(receitaTotal, 0)}
          nota="preço × demanda, somado"
        />
        <ResumoCard
          titulo="Lucro mensal total"
          valor={formatCurrency(lucroTotal, 0)}
          nota="soma de (preço − custo) × demanda"
        />
        <ResumoCard
          titulo="Margem consolidada"
          valor={formatPercent(margemConsolidada)}
          nota="lucro total ÷ receita total (ponderada)"
          destaque
        />
      </Box>

      {/* Top 10 por lucro */}
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Top 10 · Lucro mensal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Produtos que mais concentram o resultado do catálogo
          </Typography>

          <Stack spacing={1.5}>
            {top10.map((produto) => (
              <Stack key={produto.id} direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  title={produto.nome}
                  sx={{ width: 160, textAlign: "right", flexShrink: 0 }}
                >
                  {produto.nome}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={maiorLucro > 0 ? (produto.lucro / maiorLucro) * 100 : 0}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "grey.100",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "grey.900",
                      borderRadius: 999,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    width: 96,
                    textAlign: "right",
                    flexShrink: 0,
                    ...numerosTabulados,
                  }}
                >
                  {formatCurrency(produto.lucro, 0)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Catálogo com busca e ordenação */}
      <Card variant="outlined">
        <Box
          className="flex flex-wrap items-end justify-between gap-4"
          sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Catálogo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {produtosFiltrados.length} produtos
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            className="flex-wrap"
            sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={apenasPrejuizo}
                  onChange={(event) => setApenasPrejuizo(event.target.checked)}
                />
              }
              label="Somente prejuízo"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "text.secondary" } }}
            />

            <TextField
              id="busca"
              size="small"
              placeholder="Buscar por nome…"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: "100%", sm: 280 }, flex: { xs: 1, sm: "none" } }}
            />
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={celulaCabecalho}>Produto</TableCell>
                <TableCell align="right" sx={celulaCabecalho}>
                  Preço
                </TableCell>
                <TableCell align="right" sx={celulaCabecalho}>
                  Custo
                </TableCell>
                <TableCell align="right" sx={celulaCabecalho} sortDirection={ordemMargem}>
                  <TableSortLabel
                    active
                    direction={ordemMargem}
                    onClick={() =>
                      setOrdemMargem((atual) => (atual === "asc" ? "desc" : "asc"))
                    }
                  >
                    Margem %
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={celulaCabecalho}>
                  Receita
                </TableCell>
                <TableCell align="right" sx={celulaCabecalho}>
                  Lucro
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosOrdenados.map((produto) => (
                <TableRow key={produto.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{produto.nome}</TableCell>
                  <TableCell align="right" sx={numerosTabulados}>
                    {formatCurrency(produto.precoNormalizado)}
                  </TableCell>
                  <TableCell align="right" sx={numerosTabulados}>
                    {formatCurrency(produto.custoNormalizado)}
                  </TableCell>
                  <TableCell align="right">
                    <MargemChip margem={produto.margem} />
                  </TableCell>
                  <TableCell align="right" sx={numerosTabulados}>
                    {formatCurrency(produto.receita)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, ...numerosTabulados }}
                  >
                    {formatCurrency(produto.lucro)}
                  </TableCell>
                </TableRow>
              ))}

              {produtosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.disabled" }}>
                    {apenasPrejuizo
                      ? "Nenhum produto com prejuízo."
                      : `Nenhum produto encontrado para “${busca}”.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: "block" }}>
        Margem consolidada = lucro total ÷ receita total (ponderada pelo peso de cada produto), nunca
        a média simples das margens. Valores em R$ · formatação pt-BR.
      </Typography>
    </Container>
  );
}
