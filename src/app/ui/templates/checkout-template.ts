import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Esqueleto do checkout: cabeçalho com progresso, área de conteúdo e rodapé de
 * ação. Não conhece regra de negócio — só organiza as etapas curtas.
 */
@Component({
  selector: 'app-checkout-template',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header class="sticky top-0 z-30 border-b border-ink/10 bg-night/80 backdrop-blur-xl">
      <div class="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Durante o pagamento o retorno é travado: voltar aqui duplica cobrança -->
          <button
            type="button"
            [class]="classesVoltar()"
            [disabled]="bloqueado()"
            (click)="voltar.emit()"
          >
            ← Voltar
          </button>

          <span class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Etapa {{ passoAtual() }} de {{ passos().length }}
          </span>
        </div>

        <!-- Progresso em segmentos: leitura instantânea no mobile -->
        <ol class="flex items-center gap-2" [attr.aria-label]="'Progresso do checkout'">
          @for (passo of passos(); track passo; let i = $index) {
            <li class="flex flex-1 flex-col gap-1.5">
              <span
                class="h-1 w-full rounded-full transition-colors duration-300"
                [class]="i < passoAtual() ? 'bg-accent' : 'bg-ink/12'"
              ></span>
              <span
                class="text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition-colors"
                [class]="i < passoAtual() ? 'text-ink' : 'text-ink-muted'"
              >
                {{ passo }}
              </span>
            </li>
          }
        </ol>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-xl grow flex-col gap-6 px-5 py-7">
      <div class="flex flex-col gap-2">
        <h1 class="font-display text-2xl font-black tracking-tight">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="text-sm text-ink-muted">{{ subtitulo() }}</p>
        }
      </div>

      <div class="flex flex-col gap-6">
        <ng-content />
      </div>
    </main>

    @if (temRodape()) {
      <footer
        class="sticky bottom-0 border-t border-ink/10 bg-night/85 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
      >
        <div class="mx-auto flex w-full max-w-xl flex-col gap-3">
          <ng-content select="[rodape]" />
        </div>
      </footer>
    }
  `,
})
export class CheckoutTemplate {
  readonly passos = input<readonly string[]>(['Ingressos', 'Seus dados', 'Pagamento']);
  readonly passoAtual = input(1);
  readonly titulo = input('');
  readonly subtitulo = input('');
  /** Desliga o rodapé nas telas que já resolvem a ação no corpo (confirmação). */
  readonly comRodape = input(true);
  /** Trava a navegação enquanto um pagamento está em voo. */
  readonly bloqueado = input(false);

  readonly voltar = output<void>();

  protected readonly temRodape = computed(() => this.comRodape());

  protected readonly classesVoltar = computed(() => {
    const base = 'text-xs font-semibold uppercase tracking-[0.14em] transition-colors';

    return this.bloqueado()
      ? `${base} text-ink-muted opacity-50 cursor-not-allowed pointer-events-none`
      : `${base} text-ink-muted hover:text-ink cursor-pointer`;
  });
}
