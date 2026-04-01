// Serviços disponíveis para Pessoa Física (Freela em Casa)
export const servicosPF = [
  { id: "barista", label: "Barista", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "barman", label: "Barman/Bartender", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "cozinheiro", label: "Cozinheiro(a)", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "garcom", label: "Garçom/Garçonete", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza", pricePerHour: 16.67, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "auxiliar-cozinha", label: "Auxiliar de Cozinha", pricePerHour: 16.67, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "camareira", label: "Camareira", pricePerHour: 16.67, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "chapeiro", label: "Chapeiro(a)", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "cumim", label: "Cumim", pricePerHour: 16.67, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "churrasqueiro", label: "Churrasqueiro", pricePerHour: 25, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "seguranca", label: "Segurança (Não Armado)", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "hostess", label: "Hostess/Recepcionista", pricePerHour: 16.67, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "manobrista", label: "Manobrista", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "dj", label: "DJ", pricePerHour: 116.67, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-sertanejo", label: "Músico (Sertanejo)", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-rock", label: "Músico (Rock)", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-samba-pagode", label: "Músico (Samba e Pagode)", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-mpb", label: "Músico (MPB)", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-multi", label: "Músico (Multi Estilo)", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
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
  { id: "multi", label: "Multi Estilo" },
] as const;

// Taxa de retenção do Freela (20%)
export const FREELA_COMMISSION = 0.20;

// Taxa de seguro fixa por profissional
export const INSURANCE_FEE = 1;

// Calcula o valor total do serviço
export const calcularValorTotal = (
  pricePerHour: number,
  hours: number,
  professionals: number,
  insuranceFee: number = INSURANCE_FEE
): { subtotal: number; commission: number; insurance: number; total: number; freelancerValue: number } => {
  const subtotal = pricePerHour * hours * professionals;
  const commission = subtotal * FREELA_COMMISSION;
  const insurance = insuranceFee * professionals;
  const total = subtotal + insurance;
  const freelancerValue = (subtotal - commission) / professionals;
  
  return { subtotal, commission, insurance, total, freelancerValue };
};

export type ServicoPF = typeof servicosPF[number];
export type EstiloMusical = typeof estilosMusicais[number];
