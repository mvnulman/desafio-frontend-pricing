/**
 * Interpreta o valor de preço bruto vindo do ERP.
 * Pode ser number ou string em formato pt-BR.
 *
 * @param {number|string} valor
 * @returns {number}
 */
export function parsePreco(valor) {
  // Number já chega pronto (e o zero continua zero).
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  // null/undefined viram 0 para não contaminar o cálculo.
  if (valor == null) {
    return 0;
  }

  const texto = String(valor).trim();
  if (texto === "") {
    return 0;
  }

  // pt-BR: remove símbolos/espaços, trata "." como milhar e "," como decimal.
  const normalizado = texto
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number.parseFloat(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

/**
 * Normaliza as entradas e calcula os indicadores de um produto.
 *
 * @param {{ preco: number|string, custo: number|null, demanda: number }} produto
 * @returns {{ precoNormalizado: number, custoNormalizado: number|null, receita: number, lucro: number|null, margem: number|null }}
 */
export function calcularProduto(produto) {
  const precoNormalizado = parsePreco(produto.preco);
  const custoNormalizado = produto.custo != null ? parsePreco(produto.custo) : null;
  const demanda = produto.demanda ?? 0;

  const receita = precoNormalizado * demanda;

  // Custo null = desconhecido: não faz sentido estimar lucro/margem
  // (evita inflar o resultado como se o custo fosse zero).
  const lucro = custoNormalizado === null ? null : receita - custoNormalizado * demanda;

  // Sem receita (preço zero) a margem seria Infinity/NaN — devolve null.
  const margem = lucro === null || receita <= 0 ? null : (lucro / receita) * 100;

  return { precoNormalizado, custoNormalizado, receita, lucro, margem };
}

/**
 * Transforma o catálogo em uma listagem única já calculada.
 *
 * @param {Array<{ id: string, nome: string, preco: number|string, custo: number|null, demanda: number }>} catalogo
 * @returns {Array<{ id: string, nome: string, precoNormalizado: number, custoNormalizado: number|null, receita: number, lucro: number|null, margem: number|null }>}
 */
export function listarProdutos(catalogo) {
  return catalogo.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    ...calcularProduto(produto),
  }));
}
