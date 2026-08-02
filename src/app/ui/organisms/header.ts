import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Header fixo da vitrine.
 * Some ao rolar para baixo (dá a tela inteira para o conteúdo) e reaparece
 * assim que o usuário volta a subir — o gesto de quem procura o botão de compra.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'aoRolar()',
    class:
      'sticky top-0 z-40 block border-b border-ink/10 bg-night/70 backdrop-blur-xl ' +
      'transition-transform duration-300 will-change-transform animate-enter',
    '[class.-translate-y-full]': 'oculto()',
  },
  template: `
    <div class="flex items-center justify-between gap-4 px-5 py-4">
      <a routerLink="/" class="font-display text-sm font-black uppercase tracking-[0.22em]">
        Sunset<span class="text-accent">Vibezz</span>
      </a>

      <nav class="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
        <a routerLink="/checkout" class="text-ink-muted transition-colors hover:text-ink">
          Ingressos
        </a>
        <a routerLink="/admin" class="text-ink-muted transition-colors hover:text-ink">Painel</a>
      </nav>
    </div>
  `,
})
export class Header {
  protected readonly oculto = signal(false);

  private ultimaPosicao = 0;

  protected aoRolar(): void {
    const atual = window.scrollY;
    // Zona morta de 8px evita tremer o header em rolagens mínimas.
    if (Math.abs(atual - this.ultimaPosicao) < 8) {
      return;
    }

    this.oculto.set(atual > this.ultimaPosicao && atual > 120);
    this.ultimaPosicao = atual;
  }
}
