import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { LIMITE_POR_PEDIDO } from '../mocks/dados-mock';
import { CheckoutRequest, CheckoutResponse, Evento, LoteVitrine } from '../models';
import { TicketMockService } from '../services/ticket-mock.service';

/**
 * Estado central da bilheteria.
 *
 * Concentra o que a vitrine e o checkout precisam saber: dados do evento,
 * situação dos lotes e — principalmente — as flags de carregamento que
 * governam skeletons, overlays e o bloqueio de botões.
 */
@Injectable({ providedIn: 'root' })
export class BilheteriaStore {
  private readonly api = inject(TicketMockService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly eventoSig = signal<Evento | null>(null);
  private readonly lotesSig = signal<readonly LoteVitrine[]>([]);
  private readonly carregandoSig = signal(false);
  private readonly processandoPagamentoSig = signal(false);
  private readonly erroSig = signal<string | null>(null);
  private readonly ultimoPedidoSig = signal<CheckoutResponse | null>(null);
  private readonly quantidadeSig = signal(1);
  private readonly vitrineCarregadaSig = signal(false);

  // --- Leitura pública -----------------------------------------------------

  readonly evento = this.eventoSig.asReadonly();
  readonly lotes = this.lotesSig.asReadonly();
  /** `isLoading` — dispara os skeletons e o loading fullscreen. */
  readonly carregando = this.carregandoSig.asReadonly();
  /** `isProcessingPayment` — dispara o modal de processamento e trava os botões. */
  readonly processandoPagamento = this.processandoPagamentoSig.asReadonly();
  readonly erro = this.erroSig.asReadonly();
  readonly ultimoPedido = this.ultimoPedidoSig.asReadonly();
  readonly quantidade = this.quantidadeSig.asReadonly();
  readonly vitrineCarregada = this.vitrineCarregadaSig.asReadonly();

  readonly loteAtivo = computed(() => this.lotesSig().find((lote) => lote.status === 'ativo') ?? null);
  readonly proximoLote = computed(
    () => this.lotesSig().find((lote) => lote.status === 'aguardando') ?? null,
  );
  readonly disponivel = computed(() => this.loteAtivo()?.disponivel ?? 0);
  readonly acabando = computed(() => this.loteAtivo()?.acabando ?? false);
  readonly esgotado = computed(() => this.vitrineCarregadaSig() && this.loteAtivo() === null);

  /** Teto real de ingressos no seletor: o menor entre o limite e o estoque. */
  readonly maximoPorPedido = computed(() => Math.min(LIMITE_POR_PEDIDO, this.disponivel()));

  readonly totalSelecionadoCentavos = computed(() => {
    const lote = this.loteAtivo();
    return lote ? lote.totalCentavos * this.quantidadeSig() : 0;
  });

  // --- Comandos ------------------------------------------------------------

  /**
   * Carrega evento e lotes em paralelo.
   * `forcar` é usado após uma compra, quando o estoque precisa ser relido.
   */
  carregarVitrine(forcar = false): void {
    if (this.carregandoSig() || (this.vitrineCarregadaSig() && !forcar)) {
      return;
    }

    this.carregandoSig.set(true);
    this.erroSig.set(null);

    forkJoin({
      evento: this.api.obterEvento(),
      lotes: this.api.obterLotes(),
    })
      .pipe(
        catchError(() => {
          this.erroSig.set('Não conseguimos carregar o evento agora. Tente novamente.');
          return EMPTY;
        }),
        finalize(() => this.carregandoSig.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ evento, lotes }) => {
        this.eventoSig.set(evento);
        this.lotesSig.set(lotes);
        this.vitrineCarregadaSig.set(true);
        this.ajustarQuantidadeAoEstoque();
      });
  }

  definirQuantidade(quantidade: number): void {
    const teto = Math.max(1, this.maximoPorPedido());
    this.quantidadeSig.set(Math.min(Math.max(1, Math.trunc(quantidade)), teto));
  }

  /**
   * Executa a compra.
   *
   * Só um pagamento pode estar em voo por vez: uma segunda chamada enquanto
   * `processandoPagamento` está ligada é descartada. É a mesma prevenção de
   * duplicidade aplicada visualmente nos botões, garantida também no estado.
   */
  finalizarCompra(requisicao: CheckoutRequest): Observable<CheckoutResponse> {
    if (this.processandoPagamentoSig()) {
      return EMPTY;
    }

    this.processandoPagamentoSig.set(true);
    this.erroSig.set(null);

    return this.api.processarCheckout(requisicao).pipe(
      tap((resposta) => {
        this.ultimoPedidoSig.set(resposta);
        if (!resposta.sucesso) {
          this.erroSig.set(resposta.mensagem);
        }
        // O estoque mudou (venda concluída ou lote encerrado): relê a vitrine.
        this.recarregarLotes();
      }),
      catchError(() => {
        const mensagem = 'Falha inesperada ao processar o pagamento. Tente novamente.';
        this.erroSig.set(mensagem);

        const falha: CheckoutResponse = {
          sucesso: false,
          status: 'recusado',
          pedidoId: '',
          loteNome: this.loteAtivo()?.nome ?? '',
          quantidade: requisicao.quantidade,
          totalCentavos: 0,
          ingressos: [],
          motivoFalha: 'erro_inesperado',
          mensagem,
        };
        this.ultimoPedidoSig.set(falha);
        return of(falha);
      }),
      finalize(() => this.processandoPagamentoSig.set(false)),
    );
  }

  limparErro(): void {
    this.erroSig.set(null);
  }

  limparPedido(): void {
    this.ultimoPedidoSig.set(null);
    this.quantidadeSig.set(1);
  }

  private recarregarLotes(): void {
    this.api
      .obterLotes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lotes) => {
        this.lotesSig.set(lotes);
        this.ajustarQuantidadeAoEstoque();
      });
  }

  /** Impede que a quantidade escolhida fique maior que o estoque após a virada. */
  private ajustarQuantidadeAoEstoque(): void {
    const teto = this.maximoPorPedido();
    if (teto > 0 && this.quantidadeSig() > teto) {
      this.quantidadeSig.set(teto);
    }
  }
}
