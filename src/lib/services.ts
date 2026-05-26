// Categorias para organizar os serviços
export const categoriasServicos = [
  { id: "alimentacao", label: "Alimentação & Bebidas", description: "Equipe operacional para bares, restaurantes e cozinhas" },
  { id: "eventos", label: "Eventos Sociais", description: "Profissionais especializados para festas e eventos" },
  { id: "corporativo", label: "Corporativo", description: "Equipes para eventos corporativos e empresariais" },
  { id: "apoio", label: "Apoio & Operacional", description: "Limpeza, segurança, recepção e suporte" },
  { id: "infantil", label: "Recreação Infantil", description: "Monitores e recreadores para crianças" },
  { id: "musica", label: "Música & DJ", description: "DJs e músicos de diversos estilos" },
  { id: "premium", label: "Experiências Premium", description: "Serviços exclusivos e especializados" },
] as const;

export type CategoriaServicoId = typeof categoriasServicos[number]["id"];

// Serviços disponíveis para Pessoa Física (Freela em Casa)
export const servicosPF = [
  // Alimentação & Bebidas
  { id: "barista", label: "Barista", category: "alimentacao", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "barman", label: "Barman/Bartender", category: "alimentacao", pricePerHour: 25, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "cozinheiro", label: "Cozinheiro(a)", category: "alimentacao", pricePerHour: 25, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "copeiro", label: "Copeiro(a)", category: "alimentacao", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "atendente", label: "Atendente", category: "alimentacao", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "garcom", label: "Garçom/Garçonete", category: "alimentacao", pricePerHour: 25, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "auxiliar-cozinha", label: "Auxiliar de Cozinha", category: "alimentacao", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "chapeiro", label: "Chapeiro(a)", category: "alimentacao", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "cumim", label: "Cumim", category: "alimentacao", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "churrasqueiro", label: "Churrasqueiro", category: "alimentacao", pricePerHour: 25, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },

  // Eventos Sociais
  { id: "garcom-evento", label: "Garçom/Garçonete (Evento)", category: "eventos", pricePerHour: 65, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "bartender-evento", label: "Bartender (Evento)", category: "eventos", pricePerHour: 75, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "cozinheiro-evento", label: "Cozinheiro(a) (Evento)", category: "eventos", pricePerHour: 75, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "auxiliar-cozinha-evento", label: "Auxiliar de Cozinha (Evento)", category: "eventos", pricePerHour: 50, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "copeira-evento", label: "Copeira/Negócio (Evento)", category: "eventos", pricePerHour: 50, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "auxiliar-limpeza-evento", label: "Auxiliar de Limpeza (Evento)", category: "eventos", pricePerHour: 50, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },

  // Corporativo
  { id: "recepcionista-corp", label: "Recepcionista (Corporativo)", category: "corporativo", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "hostess-corp", label: "Hostess (Corporativo)", category: "corporativo", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "promotor-corp", label: "Promotor(a) de Eventos (Corporativo)", category: "corporativo", pricePerHour: 25, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "credenciamento-corp", label: "Operador(a) de Credenciamento (Corporativo)", category: "corporativo", pricePerHour: 40, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "coordenador-corp", label: "Coordenador(a) de Evento (Corporativo)", category: "corporativo", pricePerHour: 70, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "brigadista-corp", label: "Brigadista (Corporativo)", category: "corporativo", pricePerHour: 45, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "modelo-corp", label: "Modelo (Corporativo)", category: "corporativo", pricePerHour: 50, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "apoio-operacional-corp", label: "Apoio Operacional (Corporativo)", category: "corporativo", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "organizacao-filas-corp", label: "Organização das filas (Corporativo)", category: "corporativo", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "seguranca-corp", label: "Segurança (Não Armado) (Corporativo)", category: "corporativo", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },

  // Apoio & Operacional
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza", category: "apoio", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "camareira", label: "Camareira", category: "apoio", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "seguranca", label: "Segurança (Não Armado)", category: "apoio", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "hostess", label: "Hostess/Recepcionista", category: "apoio", pricePerHour: 20, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "manobrista", label: "Manobrista", category: "apoio", pricePerHour: 20, minHoursCasa: 4, minHoursEmpresa: 6, insuranceFee: 1 },

  // Recreação Infantil
  { id: "monitor-infantil", label: "Monitor Infantil", category: "infantil", pricePerHour: 25, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },
  { id: "recreador", label: "Recreador(a)", category: "infantil", pricePerHour: 30, minHoursCasa: 6, minHoursEmpresa: 6, insuranceFee: 1 },

  // Música & DJ
  { id: "dj", label: "DJ", category: "musica", pricePerHour: 116.67, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-sertanejo", label: "Músico (Sertanejo)", category: "musica", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-rock", label: "Músico (Rock)", category: "musica", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-samba-pagode", label: "Músico (Samba e Pagode)", category: "musica", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-mpb", label: "Músico (MPB)", category: "musica", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },
  { id: "musico-multi", label: "Músico (Multi Estilo)", category: "musica", pricePerHour: 150, minHoursCasa: 3, minHoursEmpresa: 3, insuranceFee: 1 },

  // Experiências Premium
  { id: "private-chef", label: "Private Chef / Chef em Casa", category: "premium", pricePerHour: 150, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "bartender-autoral", label: "Bartender Especializado Autoral", category: "premium", pricePerHour: 100, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "confeiteiro-premium", label: "Confeiteiro / Bolos sob Demanda", category: "premium", pricePerHour: 80, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
  { id: "sommelier", label: "Sommelier", category: "premium", pricePerHour: 90, minHoursCasa: 4, minHoursEmpresa: 4, insuranceFee: 1 },
] as const;

// Agrupa serviços por categoria
export const servicosPorCategoria = categoriasServicos.map((cat) => ({
  ...cat,
  servicos: servicosPF.filter((s) => s.category === cat.id),
}));

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
