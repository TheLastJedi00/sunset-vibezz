import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LoteVitrine } from '../../core/models';
import { Badge } from '../atoms/badge';
import { Button } from '../atoms/button';

/**
 * Cartão de lote da vitrine.
 * O lote ativo é o único com preço em destaque e CTA; os demais existem para
 * mostrar ao comprador o que ele perde ao esperar (ou já perdeu).
 */
@Component({
  selector: 'app-lote-card',
  imports: [CurrencyPipe, Badge, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let l = lote();

    <article [class]="classesCartao()">
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <h3 class="font-display text-xl font-black uppercase tracking-tight">{{ l.nome }}</h3>
            <p class="text-xs text-ink-muted">
              {{ l.quantidadeTotal }} ingressos neste lote
            </p>
          </div>

          @switch (l.status) {
            @case ('ativo') {
              <app-badge tone="success" [dot]="true" [pulse]="true">Vendendo</app-badge>
            }
            @case ('aguardando') {
              <app-badge tone="muted">Em breve</app-badge>
            }
            @case ('esgotado') {
              <app-badge tone="alert">Esgotado</app-badge>
            }
          }
        </div>

        <div class="flex items-end gap-2">
          <span
            class="font-display text-4xl font-black tabular-nums"
            [class]="ativo() ? 'text-accent' : 'text-ink-muted'"
            [class.line-through]="l.status === 'esgotado'"
          >
            {{ l.totalCentavos / 100 | currency: 'BRL' }}
          </span>
          <span class="pb-1.5 text-xs text-ink-muted">por pessoa</span>
        </div>

        @if (ativo()) {
          <p class="text-xs text-ink-muted">
            Sem taxa de conveniência — o valor acima é o que você paga.
          </p>

          <app-button size="lg" [disabled]="l.disponivel === 0" (pressed)="comprar.emit(l)">
            Garantir ingresso
          </app-button>
        } @else if (l.status === 'aguardando') {
          <p class="text-xs text-ink-muted">
            Libera automaticamente assim que o lote anterior esgotar.
          </p>
        } @else {
          <p class="text-xs text-ink-muted">Esgotado em pré-venda.</p>
        }
      </div>
    </article>
  `,
})
export class LoteCard {
  readonly lote = input.required<LoteVitrine>();
  readonly comprar = output<LoteVitrine>();

  protected readonly ativo = computed(() => this.lote().status === 'ativo');

  protected readonly classesCartao = computed(() => {
    const base = 'flex flex-col rounded-3xl border p-5 backdrop-blur-xl transition-colors';

    if (this.ativo()) {
      return `${base} border-accent/35 bg-primary/35 shadow-[0_20px_60px_-30px_var(--color-accent)]`;
    }

    return this.lote().status === 'esgotado'
      ? `${base} border-ink/8 bg-ink/[0.02] opacity-60`
      : `${base} border-ink/10 bg-ink/[0.025]`;
  });
}
