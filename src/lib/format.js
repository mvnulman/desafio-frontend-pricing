const N_D = "N/D";

const currencyFormatters = {
  2: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
  0: new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
};

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Verifica se o valor pode ser formatado.
 * null/undefined/NaN são "não disponíveis" — diferentes de 0.
 *
 * @param {unknown} valor
 * @returns {boolean}
 */
function semValor(valor) {
  return valor == null || (typeof valor === "number" && Number.isNaN(valor));
}

/**
 * Formata um valor em moeda brasileira (R$).
 * Retorna "N/D" para valores ausentes (null/undefined/NaN).
 *
 * @param {number|null|undefined} valor
 * @param {number} [casas=2] casas decimais (0 para totais arredondados)
 * @returns {string}
 */
export function formatCurrency(valor, casas = 2) {
  if (semValor(valor)) return N_D;
  return (currencyFormatters[casas] ?? currencyFormatters[2]).format(valor);
}

/**
 * Formata um percentual em pt-BR com duas casas decimais.
 * Recebe o valor em pontos percentuais (ex.: 47.65 → "47,65%").
 * Retorna "N/D" para valores ausentes (null/undefined/NaN).
 *
 * @param {number|null|undefined} valor
 * @returns {string}
 */
export function formatPercent(valor) {
  return semValor(valor) ? N_D : percentFormatter.format(valor / 100);
}
