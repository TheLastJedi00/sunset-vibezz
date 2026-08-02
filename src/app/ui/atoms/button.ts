import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'lg';

/**
 * Átomo de ação. Concentra a regra de bloqueio anti-duplicidade exigida na spec:
 * enquanto `loading` estiver ativo o botão perde ponteiro, reduz opacidade e
 * troca o rótulo por "Processando...".
 */
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="isBlocked()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="pressed.emit()"
    >
      @if (loading()) {
        <span
          class="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        ></span>
        <span>{{ loadingLabel() }}</span>
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('accent');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly loadingLabel = input('Processando...');
  readonly full = input(true);

  readonly pressed = output<void>();

  protected readonly isBlocked = computed(() => this.loading() || this.disabled());

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight ' +
      'transition-[transform,background-color,box-shadow,opacity] duration-200 active:scale-[0.98] select-none';

    const sizes: Record<ButtonSize, string> = {
      md: 'px-5 py-3 text-sm',
      lg: 'px-6 py-4 text-base',
    };

    const variants: Record<ButtonVariant, string> = {
      accent:
        'bg-accent text-night shadow-[0_10px_30px_-10px_var(--color-accent)] hover:bg-accent-soft',
      outline:
        'border border-accent/60 text-accent hover:bg-accent/10 hover:border-accent',
      ghost: 'text-ink-muted hover:text-ink hover:bg-ink/5',
    };

    // Bloqueio de interação (prevenção de duplicidade) exigido pela spec.
    const blocked = this.isBlocked() ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    return [base, sizes[this.size()], variants[this.variant()], blocked, this.full() ? 'w-full' : '']
      .filter(Boolean)
      .join(' ');
  });
}
