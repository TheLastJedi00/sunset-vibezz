import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BilheteriaStore } from '../../core/state/bilheteria-store';
import { Header } from '../../ui/organisms/header';
import { Hero } from '../../ui/organisms/hero';

@Component({
  selector: 'app-vitrine-page',
  imports: [Header, Hero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />

    <main class="mx-auto flex w-full max-w-2xl grow flex-col pb-24">
      @if (store.evento(); as evento) {
        <app-hero [evento]="evento" />
      }

      @if (store.erro(); as erro) {
        <p
          class="mx-5 mt-6 animate-enter rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        >
          {{ erro }}
        </p>
      }
    </main>
  `,
})
export class VitrinePage implements OnInit {
  protected readonly store = inject(BilheteriaStore);

  ngOnInit(): void {
    this.store.carregarVitrine();
  }
}
