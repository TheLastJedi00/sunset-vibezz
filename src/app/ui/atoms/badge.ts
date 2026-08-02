import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'accent' | 'muted' | 'alert' | 'success';

/** Átomo de rotulagem: status de lote, escassez e marcadores curtos. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      @if (dot()) {
        <span class="size-1.5 rounded-full bg-current" [class.animate-breathe]="pulse()" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
})
export class Badge {
  readonly tone = input<BadgeTone>('accent');
  readonly dot = input(false);
  readonly pulse = input(false);

  protected readonly classes = computed(() => {
    const tones: Record<BadgeTone, string> = {
      accent: 'bg-accent/12 text-accent border-accent/30',
      muted: 'bg-ink/5 text-ink-muted border-ink/10',
      alert: 'bg-red-500/12 text-red-300 border-red-400/30',
      success: 'bg-emerald-500/12 text-emerald-300 border-emerald-400/30',
    };

    return (
      'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 ' +
      'text-[0.7rem] font-semibold uppercase tracking-[0.14em] ' +
      tones[this.tone()]
    );
  });
}
