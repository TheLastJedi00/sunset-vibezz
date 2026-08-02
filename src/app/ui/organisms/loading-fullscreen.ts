import { ChangeDetectionStrategy, Component, effect, input, signal, untracked } from '@angular/core';

/**
 * Loading de tela cheia usado sempre que uma página dispara requisição no
 * `ngOnInit`. Entra com `animate-enter` e sai com `animate-leave` — por isso o
 * componente controla a própria desmontagem em vez de depender só de um `@if`.
 */
@Component({
  selector: 'app-loading-fullscreen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (montado()) {
      <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-night/75 backdrop-blur-xl"
        [class]="saindo() ? 'animate-leave-fade' : 'animate-enter-fade'"
        role="status"
        aria-live="polite"
      >
        <div class="relative flex size-20 items-center justify-center">
          <span class="absolute inset-0 rounded-full border border-accent/20"></span>
          <span
            class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent"
          ></span>
          <span class="size-2.5 animate-breathe rounded-full bg-accent"></span>
        </div>

        <div class="flex flex-col items-center gap-2 px-8 text-center">
          <p class="font-display text-sm font-black uppercase tracking-[0.3em] text-ink">
            Sunset Vibezz
          </p>
          <p class="text-sm text-ink-muted">{{ mensagem() }}</p>
        </div>
      </div>
    }
  `,
})
export class LoadingFullscreen {
  readonly visivel = input(false);
  readonly mensagem = input('Carregando o evento...');

  protected readonly montado = signal(false);
  protected readonly saindo = signal(false);

  /** Duração de `--animate-leave-fade`; mantém o overlay vivo até o fade acabar. */
  private static readonly DURACAO_SAIDA = 180;
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const visivel = this.visivel();

      if (this.temporizador) {
        clearTimeout(this.temporizador);
        this.temporizador = null;
      }

      if (visivel) {
        this.saindo.set(false);
        this.montado.set(true);
        return;
      }

      // `untracked`: o efeito reage à visibilidade, não ao próprio ciclo de montagem.
      if (!untracked(this.montado)) {
        return;
      }

      this.saindo.set(true);
      this.temporizador = setTimeout(() => {
        this.montado.set(false);
        this.saindo.set(false);
      }, LoadingFullscreen.DURACAO_SAIDA);
    });
  }
}
