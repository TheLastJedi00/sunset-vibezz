import { Comprador } from './comprador';
import { Ingresso } from './ingresso';

export type MetodoPagamento = 'pix' | 'cartao';

export interface DadosCartao {
  readonly numero: string;
  readonly titular: string;
  readonly validade: string;
  readonly cvv: string;
  readonly parcelas: number;
}

/** Payload enviado ao backend (hoje, ao mock) para reservar e cobrar. */
export interface CheckoutRequest {
  readonly loteId: string;
  readonly quantidade: number;
  readonly comprador: Comprador;
  readonly metodo: MetodoPagamento;
  readonly cartao?: DadosCartao;
}

export type StatusPagamento = 'aprovado' | 'recusado' | 'aguardando_pix';

/** Motivos de falha que a UI precisa distinguir para orientar o comprador. */
export type MotivoFalha =
  | 'estoque_insuficiente'
  | 'lote_encerrado'
  | 'pagamento_recusado'
  | 'erro_inesperado';

export interface CheckoutResponse {
  readonly sucesso: boolean;
  readonly status: StatusPagamento;
  readonly pedidoId: string;
  readonly loteNome: string;
  readonly quantidade: number;
  readonly totalCentavos: number;
  readonly ingressos: readonly Ingresso[];
  /** Preenchido apenas em PIX aprovado — copia e cola exibido na confirmação. */
  readonly pixCopiaECola?: string;
  /** Simula o e-mail disparado com o ingresso digital. */
  readonly emailEnviadoPara?: string;
  readonly motivoFalha?: MotivoFalha;
  readonly mensagem: string;
}
