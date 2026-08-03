import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RegiaoCompradores } from '../../core/models';
import { Skeleton } from '../atoms/skeleton';

/**
 * Ranking de origem do público (bairro/cidade a partir do CEP do checkout).
 * Barras horizontais numa cor só: a comparação é de magnitude entre regiões,
 * e o nome de cada uma já é a identidade — legenda seria ruído.
 */
@Component({
  selector: 'app-relatorio-regioes',
  imports: [CurrencyPipe, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-5">
      @if (carregando()) {
        <div class="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-ink/[0.03] p-5">
          @for (linha of esqueletos; track linha) {
            <div class="flex flex-col gap-2">
              <app-skeleton class="h-4 w-48" radius="rounded-full" />
              <app-skeleton class="h-2.5 w-full" radius="rounded-full" />
            </div>
          }
        </div>
      } @else if (regioes().length) {
        <div class="flex flex-col gap-2 rounded-3xl border border-accent/25 bg-primary/30 p-5">
          <span class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Concentração do público
          </span>
          @if (lider(); as topo) {
            <p class="font-display text-xl font-black">
              {{ topo.bairro }} lidera com {{ topo.participacao }}%
            </p>
          }
          <p class="text-xs text-ink-muted">
            As 3 primeiras regiões somam {{ concentracaoTop3() }}% dos ingressos — comece a mídia
            por elas.
          </p>
        </div>

        <section class="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-ink/[0.03] p-5">
          <h2 class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Ingressos por região
          </h2>

          @for (regiao of regioes(); track regiao.bairro + regiao.cidade; let i = $index) {
            <div class="flex flex-col gap-2">
              <div class="flex items-baseline justify-between gap-3">
                <span class="text-sm">
                  <span class="font-display font-bold">{{ regiao.bairro }}</span>
                  <span class="text-ink-muted"> · {{ regiao.cidade }}/{{ regiao.uf }}</span>
                </span>
                <span class="shrink-0 text-xs tabular-nums text-ink-muted">
                  {{ regiao.ingressos }} ing. · {{ regiao.participacao }}%
                </span>
              </div>

              <div class="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  class="h-full rounded-full transition-[width] duration-700"
                  [class]="i === 0 ? 'bg-accent' : 'bg-accent/55'"
                  [style.width.%]="largura(regiao)"
                ></div>
              </div>

              <span class="text-[0.68rem] text-ink-muted">
                {{ regiao.compradores }} compradores ·
                {{ regiao.receitaCentavos / 100 | currency: 'BRL' }}
              </span>
            </div>
          }
        </section>
      } @else {
        <p class="rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink-muted">
          Ainda não há compradores suficientes para gerar o relatório.
        </p>
      }
    </div>
  `,
})
export class RelatorioRegioes {
  readonly regioes = input<readonly RegiaoCompradores[]>([]);
  readonly carregando = input(false);

  protected readonly esqueletos = [1, 2, 3, 4, 5, 6];

  protected readonly lider = computed(() => this.regioes()[0] ?? null);

  protected readonly concentracaoTop3 = computed(() => {
    const soma = this.regioes()
      .slice(0, 3)
      .reduce((total, regiao) => total + regiao.participacao, 0);
    return Math.round(soma * 10) / 10;
  });

  /** Escala relativa ao líder: usa a largura total para o topo do ranking. */
  protected largura(regiao: RegiaoCompradores): number {
    const maximo = this.lider()?.ingressos ?? 0;
    return maximo ? Math.round((regiao.ingressos / maximo) * 100) : 0;
  }
}
