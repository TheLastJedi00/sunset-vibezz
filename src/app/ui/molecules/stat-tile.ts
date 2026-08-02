import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Skeleton } from '../atoms/skeleton';

/**
 * Número-herói do painel. Sem gráfico: quando o dado é um valor só, o valor
 * grande lido direto é a melhor visualização.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="flex h-full flex-col gap-1.5 rounded-3xl border border-ink/10 bg-ink/[0.03] p-5 backdrop-blur-xl"
    >
      <span class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {{ rotulo() }}
      </span>

      @if (carregando()) {
        <app-skeleton class="h-9 w-28" radius="rounded-xl" />
        <app-skeleton class="mt-1 h-3 w-20" radius="rounded-full" />
      } @else {
        <span
          class="font-display text-[clamp(1.5rem,6vw,1.875rem)] font-black tabular-nums break-words"
          [class]="destaque() ? 'text-accent' : 'text-ink'"
        >
          {{ valor() }}
        </span>

        @if (apoio()) {
          <span class="text-xs text-ink-muted">{{ apoio() }}</span>
        }
      }
    </div>
  `,
})
export class StatTile {
  readonly rotulo = input.required<string>();
  readonly valor = input<string>('');
  readonly apoio = input('');
  readonly destaque = input(false);
  readonly carregando = input(false);
}
