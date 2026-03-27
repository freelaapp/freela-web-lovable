export const errorMessages = {
  // Validação de campos
  required: (field: string) => `Ops! Não esqueça de preencher o ${field}.`,
  invalidEmail: "Hmm, esse e-mail não parece válido. Verifique e tente novamente.",
  invalidPhone: "O número de celular informado não é válido.",
  invalidCpf: "O CPF informado não é válido.",
  invalidCnpj: "O CNPJ informado não é válido.",
  passwordTooShort: "Sua senha precisa ter pelo menos 6 caracteres.",
  passwordTooLong: "Sua senha é muito longa. Tente uma mais curta.",
  passwordsDontMatch: "As senhas não conferem. Digite novamente.",
  passwordRequirements: "Sua senha ainda não atende todos os requisitos.",
  minAge: "Você precisa ter pelo menos 18 anos para se cadastrar.",
  mustAcceptTerms: "Para continuar, você precisa aceitar os termos de uso.",
  selectAtLeastOne: (item: string) => `Selecione pelo menos ${item}.`,
  minHours: (label: string, min: number, configured: number) =>
    `Para "${label}", o mínimo é ${min}h. Você configurou ${configured.toFixed(1)}h.`,
  maxHours: (label: string, configured: number) =>
    `Para "${label}", o máximo é 12h. Você configurou ${configured.toFixed(1)}h.`,

  // Autenticação e sessão
  sessionExpired: "Sua sessão expirou. Faça login novamente para continuar.",
  invalidCredentials: "E-mail ou senha incorretos. Verifique e tente novamente.",
  tooManyAttempts: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
  emailAlreadyRegistered: "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.",
  tokenNotFound: "Não foi possível verificar sua identidade. Faça login novamente.",

  // Conexão e rede
  connectionError: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  unexpectedError: "Algo deu errado. Tente novamente em alguns instantes.",

  // Confirmação de email
  confirmationCodeInvalid: "Código inválido ou expirado. Solicite um novo código e tente novamente.",
  couldNotSendCode: "Não foi possível enviar o código. Verifique o e-mail e tente novamente.",

  // Cadastro e perfil
  registrationFailed: "Não foi possível completar seu cadastro. Tente novamente.",
  profileLoadFailed: "Não foi possível carregar o perfil. Tente novamente.",
  profileUpdateFailed: "Não foi possível salvar suas alterações. Tente novamente.",
  photoUpdateFailed: "Não foi possível atualizar sua foto. Tente novamente.",
  partialUpdate: "Algumas alterações foram salvas, mas outras não. Tente novamente.",
  noChangesDetected: "Nenhuma alteração foi feita.",

  // Vagas e candidaturas
  jobNotFound: "Vaga não encontrada.",
  maxCandidatesReached: "Esta vaga já atingiu o número máximo de candidatos.",
  alreadyApplied: "Você já se candidatou para esta vaga.",
  applicationFailed: "Não foi possível enviar sua candidatura. Tente novamente.",
  couldNotApply: "Não foi possível se candidatar. Tente novamente.",
  cannotDeleteJob: "Não é possível excluir esta vaga. Ela pode ter candidatos ou já estar em andamento.",
  deleteJobFailed: "Não foi possível excluir a vaga. Tente novamente.",

  // Pagamento
  paymentFailed: "Não foi possível processar o pagamento. Tente novamente.",

  // Configurações
  settingsLoadFailed: "Não foi possível carregar as configurações.",
  settingsSaveFailed: "Não foi possível salvar as configurações. Tente novamente.",

  // Recuperação de senha
  recoveryFailed: "Não foi possível solicitar a recuperação de senha. Tente novamente.",
  resetPasswordFailed: "Não foi possível redefinir sua senha. Tente novamente.",

  // Disponibilidade e horários
  invalidTimeFormat: "Formato de hora inválido.",
  invalidHourRange: "As horas devem estar entre 00h e 23h.",
  invalidSchedule: (dia: string) =>
    `O horário "até" precisa ser maior que o horário "de" no dia ${dia}.`,
  daysWithoutSchedule: (days: string) =>
    `Os seguintes dias estão sem horário configurado: ${days}`,
  availabilityUpdateFailed: "Não foi possível atualizar sua disponibilidade. Tente novamente.",
  availabilityValidationFailed: "A validação dos horários falhou. Verifique se o horário \"até\" é posterior ao horário \"de\".",

  // Avaliação
  selectRating: "Selecione pelo menos 1 estrela para avaliar.",
  ratingRange: "Escolha entre 1 e 5 estrelas.",
  ratingFailed: "Não foi possível enviar sua avaliação. Tente novamente.",

  // Check-in/Check-out
  checkinCodeInvalid: "Código inválido. Verifique com o contratante e tente novamente.",
  checkinCodeRequired: "Digite o código de 6 dígitos.",

  // Freelancer
  freelancerNotFound: "Não foi possível identificar seu perfil. Tente novamente.",
  freelancerDataFailed: "Não foi possível carregar os dados do freelancer.",

  // Contratante
  contractorNotFound: "Perfil de contratante não encontrado.",
  contractorLoadFailed: "Não foi possível carregar o perfil do contratante.",

  // Eventos
  eventLimitReached: (limit: number, assignment: string) =>
    `Limite atingido! Já foram aceitos ${limit} freelancers para a função ${assignment}.`,
  noConfirmedFreelancers: "Nenhum freelancer foi confirmado ainda.",
  checkoutCodeFailed: "Não foi possível gerar o código de check-out.",

  // Campos comuns de formulário
  fields: {
    nome: "nome",
    email: "e-mail",
    senha: "senha",
    celular: "celular",
    cpf: "CPF",
    cnpj: "CNPJ",
    endereco: "endereço",
    numero: "número",
    bairro: "bairro",
    cidade: "cidade",
    estado: "estado",
    foto: "foto",
    sexo: "sexo",
    nascimento: "data de nascimento",
    documento: "documento",
    razaoSocial: "razão social",
    ramo: "ramo",
    responsavel: "nome do responsável",
    telefone: "telefone",
    estabelecimento: "nome do estabelecimento",
    fachada: "foto da fachada",
    area: "área de atuação",
    disponibilidade: "dia disponível",
  },
} as const;
