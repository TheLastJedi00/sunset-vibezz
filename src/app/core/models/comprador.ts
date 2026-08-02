/** Dados essenciais capturados no checkout — base de remarketing do produtor. */
export interface Comprador {
  readonly nome: string;
  readonly email: string;
  /** Apenas dígitos, com DDD. */
  readonly whatsapp: string;
  /** Apenas dígitos. */
  readonly cep: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
}

/** Registro persistido do comprador (visão do painel do produtor). */
export interface CompradorRegistro extends Comprador {
  readonly id: string;
  readonly criadoEm: string;
  readonly ingressosComprados: number;
  readonly totalGastoCentavos: number;
}
