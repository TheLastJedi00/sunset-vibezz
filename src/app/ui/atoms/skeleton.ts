import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Esqueleto pulsante para os estados de carregamento.
 * O tamanho é definido por quem usa: `<app-skeleton class="h-6 w-2/3" />`.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    'aria-hidden': 'true',
  },
  template: `<span class="sv-shimmer block size-full animate-shimmer"></span>`,
  styles: `
    .sv-shimmer {
      background-image: linear-gradient(
        100deg,
        transparent 20%,
        rgb(245 241 239 / 0.09) 45%,
        rgb(248 126 58 / 0.12) 55%,
        transparent 80%
      );
      background-size: 220% 100%;
      background-repeat: no-repeat;
    }
  `,
})
export class Skeleton {
  /** Raio da borda — acompanha o elemento que está sendo substituído. */
  readonly radius = input('rounded-xl');

  protected readonly hostClasses = computed(
    () => `block overflow-hidden bg-ink/5 ${this.radius()}`,
  );
}
