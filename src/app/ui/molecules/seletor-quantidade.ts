import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Seletor de quantidade com teto no estoque real do lote. */
@Component({
  selector: 'app-seletor-quantidade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="flex items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-ink/[0.03] p-4 backdrop-blur-xl"
    >
      <div class="flex flex-col gap-0.5">
        <span class="font-display text-base font-bold">Quantidade</span>
        <span class="text-xs text-ink-muted">Máximo de {{ maximo() }} por pedido</span>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          [class]="classesBotao(!podeDiminuir())"
          [disabled]="!podeDiminuir()"
          aria-label="Diminuir quantidade"
          (click)="alterar.emit(valor() - 1)"
        >
          −
        </button>

        <span class="w-8 text-center font-display text-2xl font-black tabular-nums">
          {{ valor() }}
        </span>

        <button
          type="button"
          [class]="classesBotao(!podeAumentar())"
          [disabled]="!podeAumentar()"
          aria-label="Aumentar quantidade"
          (click)="alterar.emit(valor() + 1)"
        >
          +
        </button>
      </div>
    </div>
  `,
})
export class SeletorQuantidade {
  readonly valor = input.required<number>();
  readonly maximo = input(6);
  readonly alterar = output<number>();

  protected readonly podeDiminuir = computed(() => this.valor() > 1);
  protected readonly podeAumentar = computed(() => this.valor() < this.maximo());

  protected classesBotao(bloqueado: boolean): string {
    const base =
      'flex size-11 items-center justify-center rounded-2xl border text-xl font-bold transition-colors';

    return bloqueado
      ? `${base} border-ink/8 text-ink-muted opacity-40 cursor-not-allowed`
      : `${base} border-accent/40 text-accent hover:bg-accent/10 cursor-pointer`;
  }
}
