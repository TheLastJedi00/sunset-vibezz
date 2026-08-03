import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DesempenhoLote, ResumoVendas } from '../../core/models';
import { Skeleton } from '../atoms/skeleton';
import { StatTile } from '../molecules/stat-tile';

/**
 * Visão geral de vendas em tempo real.
 * Uma série só (ingressos vendidos por lote) — por isso barras em uma única cor,
 * rótulo direto no valor e nenhuma legenda: identidade já está no nome do lote.
 */
@Component({
  selector: 'app-dashboard-vendas',
  imports: [CurrencyPipe, DatePipe, StatTile, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-5">
      <!-- Uma coluna no mobile (valores em BRL não cabem em 2 colunas a 390px) -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <app-stat-tile
          rotulo="Ingressos vendidos"
          [valor]="resumo()?.ingressosVendidos?.toString() ?? '—'"
          [apoio]="apoioVendidos()"
          [carregando]="carregando()"
        />

        <app-stat-tile
          rotulo="Receita bruta"
          [valor]="((resumo()?.receitaBrutaCentavos ?? 0) / 100 | currency: 'BRL') ?? ''"
          apoio="Sem taxa de terceiros"
          [destaque]="true"
          [carregando]="carregando()"
        />

        <app-stat-tile
          rotulo="Ticket médio"
          [valor]="((resumo()?.ticketMedioCentavos ?? 0) / 100 | currency: 'BRL') ?? ''"
          apoio="Por ingresso vendido"
          [carregando]="carregando()"
        />

        <app-stat-tile
          rotulo="Lote ativo"
          [valor]="resumo()?.loteAtivoNome ?? '—'"
          [apoio]="apoioLoteAtivo()"
          [carregando]="carregando()"
        />
      </div>

      <!-- Ocupação geral do evento -->
      <div class="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-ink/[0.03] p-5">
        <div class="flex items-end justify-between gap-4">
          <span class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Ocupação do evento
          </span>
          @if (!carregando()) {
            <span class="font-display text-xl font-black tabular-nums">{{ ocupacao() }}%</span>
          }
        </div>

        @if (carregando()) {
          <app-skeleton class="h-2 w-full" radius="rounded-full" />
        } @else {
          <div class="h-2 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              class="h-full rounded-full bg-accent transition-[width] duration-700"
              [style.width.%]="ocupacao()"
            ></div>
          </div>
          <p class="text-xs text-ink-muted">
            {{ resumo()?.ingressosDisponiveis }} ingressos ainda disponíveis na casa.
          </p>
        }
      </div>

      <!-- Desempenho por lote -->
      <section class="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-ink/[0.03] p-5">
        <h2 class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Desempenho por lote
        </h2>

        @if (carregando()) {
          @for (linha of esqueletos; track linha) {
            <div class="flex flex-col gap-2">
              <app-skeleton class="h-4 w-40" radius="rounded-full" />
              <app-skeleton class="h-2 w-full" radius="rounded-full" />
            </div>
          }
        } @else {
          @for (lote of desempenho(); track lote.loteId) {
            <div class="flex flex-col gap-2">
              <div class="flex items-baseline justify-between gap-3">
                <span class="font-display text-sm font-bold">{{ lote.nome }}</span>
                <span class="text-xs tabular-nums text-ink-muted">
                  {{ lote.vendidos }}/{{ lote.total }} ·
                  {{ lote.receitaCentavos / 100 | currency: 'BRL' }}
                </span>
              </div>

              <div class="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  class="h-full rounded-full transition-[width] duration-700"
                  [class]="lote.status === 'ativo' ? 'bg-accent' : 'bg-accent/45'"
                  [style.width.%]="percentual(lote)"
                ></div>
              </div>
            </div>
          }
        }
      </section>

      @if (resumo(); as r) {
        <p class="text-center text-[0.68rem] text-ink-muted">
          Atualizado às {{ r.atualizadoEm | date: 'HH:mm:ss' }}
        </p>
      }
    </div>
  `,
})
export class DashboardVendas {
  readonly resumo = input<ResumoVendas | null>(null);
  readonly desempenho = input<readonly DesempenhoLote[]>([]);
  readonly ocupacao = input(0);
  readonly carregando = input(false);

  protected readonly esqueletos = [1, 2, 3, 4];

  protected readonly apoioVendidos = computed(() => {
    const resumo = this.resumo();
    if (!resumo) {
      return '';
    }
    return `${resumo.ingressosVendidos + resumo.ingressosDisponiveis} na capacidade total`;
  });

  protected readonly apoioLoteAtivo = computed(() => {
    const resumo = this.resumo();
    if (!resumo?.loteAtivoNome) {
      return 'Nenhum lote em venda';
    }
    return `${resumo.loteAtivoDisponivel} ingressos restantes`;
  });

  protected percentual(lote: DesempenhoLote): number {
    return lote.total ? Math.round((lote.vendidos / lote.total) * 100) : 0;
  }
}
