// Serviços disponíveis para Pessoa Física (Freela em Casa)
export const servicosPF = [
  { id: "churrasqueiro", label: "Churrasqueiro", pricePerHour: 80 },
  { id: "barman", label: "Barman", pricePerHour: 70 },
  { id: "cozinheira", label: "Cozinheira(o)", pricePerHour: 75 },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza", pricePerHour: 50 },
  { id: "garcom", label: "Garçom", pricePerHour: 60 },
  { id: "musico", label: "Músico", pricePerHour: 150 },
  { id: "dj", label: "DJ", pricePerHour: 180 },
] as const;

// Estilos musicais para músicos
export const estilosMusicais = [
  { id: "sertanejo", label: "Sertanejo" },
  { id: "pagode", label: "Pagode" },
  { id: "samba", label: "Samba" },
  { id: "forro", label: "Forró" },
  { id: "mpb", label: "MPB" },
  { id: "pop", label: "Pop" },
  { id: "rock", label: "Rock" },
  { id: "gospel", label: "Gospel" },
  { id: "dj", label: "DJ" },
] as const;

// Comissão do Freela (percentual)
export const FREELA_COMMISSION = 0.15;

// Calcula o valor total do serviço
export const calcularValorTotal = (
  pricePerHour: number,
  hours: number,
  professionals: number
): { subtotal: number; commission: number; total: number; freelancerValue: number } => {
  const subtotal = pricePerHour * hours * professionals;
  const commission = subtotal * FREELA_COMMISSION;
  const total = subtotal + commission;
  const freelancerValue = subtotal / professionals;
  
  return { subtotal, commission, total, freelancerValue };
};

export type ServicoPF = typeof servicosPF[number];
export type EstiloMusical = typeof estilosMusicais[number];
