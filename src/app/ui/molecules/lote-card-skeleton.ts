import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Skeleton } from '../atoms/skeleton';

/** Espelho estrutural do <app-lote-card> durante o carregamento. */
@Component({
  selector: 'app-lote-card-skeleton',
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter-fade' },
  template: `
    <article
      class="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-ink/[0.025] p-5"
      aria-busy="true"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-2">
          <app-skeleton class="h-6 w-32" radius="rounded-lg" />
          <app-skeleton class="h-3 w-40" radius="rounded-full" />
        </div>
        <app-skeleton class="h-6 w-24" radius="rounded-full" />
      </div>

      <app-skeleton class="h-10 w-40" radius="rounded-xl" />

      @if (destaque()) {
        <app-skeleton class="h-1.5 w-full" radius="rounded-full" />
        <app-skeleton class="h-12 w-full" radius="rounded-2xl" />
        <app-skeleton class="h-13 w-full" radius="rounded-2xl" />
      }
    </article>
  `,
})
export class LoteCardSkeleton {
  /** O cartão do lote ativo é mais alto: tem barra de progresso e CTA. */
  readonly destaque = input(false);
}
