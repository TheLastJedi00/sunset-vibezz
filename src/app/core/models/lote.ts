export type StatusLote =
  /** Vendendo agora. */
  | 'ativo'
  /** Ainda não liberado — só abre quando o lote anterior esgotar. */
  | 'aguardando'
  /** Limite atingido: bloqueado definitivamente. */
  | 'esgotado';

/** Espelha a futura tabela `lotes`. */
export interface Lote {
  readonly id: string;
  readonly eventoId: string;
  readonly nome: string;
  /** Posição na fila de virada automática (1 = primeiro a vender). */
  readonly ordem: number;
  /** Em centavos — nunca usar float para dinheiro. */
  readonly precoCentavos: number;
  /** Taxa do produtor, também em centavos. */
  readonly taxaCentavos: number;
  readonly quantidadeTotal: number;
  readonly quantidadeVendida: number;
  readonly status: StatusLote;
}

/** Lote enriquecido com o que a UI precisa para decidir urgência. */
export interface LoteVitrine extends Lote {
  readonly disponivel: number;
  readonly totalCentavos: number;
  /** Estoque restante abaixo do gatilho de escassez. */
  readonly acabando: boolean;
  readonly percentualVendido: number;
}
