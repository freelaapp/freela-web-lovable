// Taxa de retenção do Freela (20%)
export const FREELA_COMMISSION = 0.20;

// Freelancer recebe 80%
export const FREELA_RECEIVES = 0.80;

// Formata número para "R$ X,XX"
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// Converte string "R$ 240,00" para número 240
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[R$\s]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Retorna valor com ou sem desconto de 20% conforme perfil
export const getDisplayValue = (
  jobValue: string | number,
  isFreelancer: boolean
): string => {
  const numericValue = typeof jobValue === 'string' 
    ? parseCurrency(jobValue) 
    : jobValue;
  
  if (isFreelancer) {
    const freelancerValue = numericValue * FREELA_RECEIVES;
    return formatCurrency(freelancerValue);
  }
  
  return formatCurrency(numericValue);
};
