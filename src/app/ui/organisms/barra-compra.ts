import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LoteVitrine } from '../../core/models';
import { Button } from '../atoms/button';

/**
 * Barra fixa de compra (mobile-first).
 * Mantém preço, escassez e CTA sempre à mão enquanto o comprador lê a página —
 * é o gatilho de impulso quando o lote está acabando.
 */
@Component({
  selector: 'app-barra-compra',
  imports: [CurrencyPipe, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'fixed inset-x-0 bottom-0 z-30 block border-t border-ink/10 bg-night/80 backdrop-blur-xl animate-enter',
  },
  template: `
    @let l = lote();

    <div class="mx-auto flex w-full max-w-2xl flex-col gap-3 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-col">
          <span class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ l.nome }}
          </span>
          <span class="font-display text-2xl font-black tabular-nums text-accent">
            {{ l.totalCentavos / 100 | currency: 'BRL' }}
          </span>
        </div>

        @if (l.acabando) {
          <span
            class="flex items-center gap-1.5 text-right text-xs font-semibold text-accent-soft animate-breathe"
          >
            <span class="size-1.5 rounded-full bg-accent"></span>
            Últimos {{ l.disponivel }}
          </span>
        } @else {
          <span class="text-right text-xs text-ink-muted">{{ l.disponivel }} disponíveis</span>
        }
      </div>

      <app-button size="lg" (pressed)="comprar.emit(l)">Comprar agora</app-button>
    </div>
  `,
})
export class BarraCompra {
  readonly lote = input.required<LoteVitrine>();
  readonly comprar = output<LoteVitrine>();
}
