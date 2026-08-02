/** Ingresso digital entregue ao comprador após a aprovação do pagamento. */
export interface Ingresso {
  readonly id: string;
  /** Código legível impresso no ingresso (ex.: SV-4F2A-91X). */
  readonly codigo: string;
  /** Conteúdo codificado no QR Code lido na portaria. */
  readonly qrCodePayload: string;
  readonly eventoNome: string;
  readonly loteNome: string;
  readonly nomeComprador: string;
  readonly precoPagoCentavos: number;
  readonly emitidoEm: string;
}
