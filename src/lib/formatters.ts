/**
 * Formata um valor numérico como moeda brasileira (R$).
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
