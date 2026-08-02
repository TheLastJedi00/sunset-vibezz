import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, forkJoin } from 'rxjs';
import { DesempenhoLote, RegiaoCompradores, ResumoVendas } from '../models';
import { TicketMockService } from '../services/ticket-mock.service';

/**
 * Estado do painel do produtor.
 * Separado da bilheteria porque tem outro ciclo de vida: o produtor recarrega
 * quando quiser, sem interferir na experiência de compra.
 */
@Injectable({ providedIn: 'root' })
export class PainelStore {
  private readonly api = inject(TicketMockService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly resumoSig = signal<ResumoVendas | null>(null);
  private readonly desempenhoSig = signal<readonly DesempenhoLote[]>([]);
  private readonly regioesSig = signal<readonly RegiaoCompradores[]>([]);
  private readonly carregandoSig = signal(false);
  private readonly carregandoRegioesSig = signal(false);
  private readonly erroSig = signal<string | null>(null);

  readonly resumo = this.resumoSig.asReadonly();
  readonly desempenho = this.desempenhoSig.asReadonly();
  readonly regioes = this.regioesSig.asReadonly();
  readonly carregando = this.carregandoSig.asReadonly();
  readonly carregandoRegioes = this.carregandoRegioesSig.asReadonly();
  readonly erro = this.erroSig.asReadonly();

  /** Percentual da capacidade total já vendida — usado na barra do dashboard. */
  readonly ocupacao = computed(() => {
    const resumo = this.resumoSig();
    if (!resumo) {
      return 0;
    }

    const capacidade = resumo.ingressosVendidos + resumo.ingressosDisponiveis;
    return capacidade ? Math.round((resumo.ingressosVendidos / capacidade) * 100) : 0;
  });

  carregarDashboard(): void {
    if (this.carregandoSig()) {
      return;
    }

    this.carregandoSig.set(true);
    this.erroSig.set(null);

    forkJoin({
      resumo: this.api.obterResumoVendas(),
      desempenho: this.api.obterDesempenhoLotes(),
    })
      .pipe(
        catchError(() => {
          this.erroSig.set('Não conseguimos carregar os números agora.');
          return EMPTY;
        }),
        finalize(() => this.carregandoSig.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ resumo, desempenho }) => {
        this.resumoSig.set(resumo);
        this.desempenhoSig.set(desempenho);
      });
  }

  /** Carregado sob demanda: só quem abre a seção de regiões paga a espera. */
  carregarRegioes(forcar = false): void {
    if (this.carregandoRegioesSig() || (this.regioesSig().length && !forcar)) {
      return;
    }

    this.carregandoRegioesSig.set(true);

    this.api
      .obterRegioes()
      .pipe(
        catchError(() => {
          this.erroSig.set('Não conseguimos montar o relatório geográfico agora.');
          return EMPTY;
        }),
        finalize(() => this.carregandoRegioesSig.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((regioes) => this.regioesSig.set(regioes));
  }
}
