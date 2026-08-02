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

/** Retorno da consulta de CEP que preenche o endereço no checkout. */
export interface EnderecoPorCep {
  readonly cep: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
  /** `false` quando caiu no endereço padrão por não estar na base. */
  readonly encontrado: boolean;
}

/** Registro persistido do comprador (visão do painel do produtor). */
export interface CompradorRegistro extends Comprador {
  readonly id: string;
  readonly criadoEm: string;
  readonly ingressosComprados: number;
  readonly totalGastoCentavos: number;
}
