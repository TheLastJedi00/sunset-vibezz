/** Cabeçalho do dashboard do produtor. */
export interface ResumoVendas {
  readonly ingressosVendidos: number;
  readonly ingressosDisponiveis: number;
  readonly receitaBrutaCentavos: number;
  readonly ticketMedioCentavos: number;
  readonly loteAtivoNome: string | null;
  readonly loteAtivoDisponivel: number;
  readonly atualizadoEm: string;
}

/** Linha do relatório de inteligência geográfica (cruzamento por CEP/bairro). */
export interface RegiaoCompradores {
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
  readonly compradores: number;
  readonly ingressos: number;
  readonly receitaCentavos: number;
  /** Participação sobre o total de ingressos vendidos (0–100). */
  readonly participacao: number;
}

/** Desempenho por lote exibido no dashboard. */
export interface DesempenhoLote {
  readonly loteId: string;
  readonly nome: string;
  readonly vendidos: number;
  readonly total: number;
  readonly receitaCentavos: number;
  readonly status: string;
}
