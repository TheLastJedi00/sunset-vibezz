import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from '../atoms/skeleton';

/**
 * Espelho estrutural do <app-hero>.
 * Ocupa exatamente o mesmo espaço do conteúdo real para que a chegada dos dados
 * não empurre a página (evita repaginação brusca).
 */
@Component({
  selector: 'app-hero-skeleton',
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter-fade' },
  template: `
    <section class="flex flex-col gap-7 px-5 pt-8 pb-4" aria-busy="true">
      <app-skeleton class="h-7 w-44" radius="rounded-full" />

      <div class="flex flex-col gap-4">
        <app-skeleton class="h-[clamp(2.5rem,14vw,5rem)] w-[85%]" radius="rounded-2xl" />
        <app-skeleton class="h-[clamp(2.5rem,14vw,5rem)] w-[70%]" radius="rounded-2xl" />
        <app-skeleton class="h-4 w-56" radius="rounded-full" />
      </div>

      <div class="flex flex-col gap-2">
        <app-skeleton class="h-4 w-full" radius="rounded-full" />
        <app-skeleton class="h-4 w-[92%]" radius="rounded-full" />
        <app-skeleton class="h-4 w-[60%]" radius="rounded-full" />
      </div>

      <div class="flex flex-col gap-5 rounded-3xl border border-ink/10 bg-ink/[0.02] p-5">
        @for (bloco of blocos; track bloco) {
          <div class="flex flex-col gap-2">
            <app-skeleton class="h-3 w-24" radius="rounded-full" />
            <app-skeleton class="h-5 w-[70%]" radius="rounded-lg" />
            <app-skeleton class="h-3 w-[55%]" radius="rounded-full" />
          </div>
        }
      </div>

      <div class="flex flex-col gap-3">
        <app-skeleton class="h-3 w-20" radius="rounded-full" />
        @for (linha of linhas; track linha) {
          <app-skeleton class="h-12 w-full" radius="rounded-2xl" />
        }
      </div>
    </section>
  `,
})
export class HeroSkeleton {
  protected readonly blocos = [1, 2, 3];
  protected readonly linhas = [1, 2, 3, 4, 5];
}
