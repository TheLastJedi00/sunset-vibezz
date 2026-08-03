/** Atração do line-up exibida na vitrine. */
export interface Atracao {
  readonly nome: string;
  readonly horario: string;
  readonly destaque: boolean;
}

export interface LocalEvento {
  readonly nome: string;
  readonly endereco: string;
  readonly cidade: string;
  readonly uf: string;
}

/** Espelha a futura tabela `eventos`. */
export interface Evento {
  readonly id: string;
  readonly nome: string;
  readonly subtitulo: string;
  readonly descricao: string;
  /** ISO 8601 — a formatação para exibição é responsabilidade da UI. */
  readonly dataInicio: string;
  readonly dataFim: string;
  readonly local: LocalEvento;
  readonly atracoes: readonly Atracao[];
  readonly classificacaoEtaria: string;
}
