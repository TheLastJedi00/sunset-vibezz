import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoteVitrine } from '../../core/models';
import { BilheteriaStore } from '../../core/state/bilheteria-store';
import { LoteCard } from '../../ui/molecules/lote-card';
import { BarraCompra } from '../../ui/organisms/barra-compra';
import { Header } from '../../ui/organisms/header';
import { Hero } from '../../ui/organisms/hero';

@Component({
  selector: 'app-vitrine-page',
  imports: [Header, Hero, LoteCard, BarraCompra],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />

    <main class="mx-auto flex w-full max-w-2xl grow flex-col pb-24">
      @if (store.evento(); as evento) {
        <app-hero [evento]="evento" />
      }

      <section id="ingressos" class="flex flex-col gap-4 px-5 pt-8">
        <h2 class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Ingressos
        </h2>

        @for (lote of store.lotes(); track lote.id) {
          <app-lote-card [lote]="lote" (comprar)="irParaCheckout($event)" />
        }

        @if (store.esgotado()) {
          <p
            class="animate-enter rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink-muted"
          >
            Todos os lotes foram vendidos. Siga o perfil do evento para saber de eventuais
            devoluções.
          </p>
        }
      </section>

      @if (store.erro(); as erro) {
        <p
          class="mx-5 mt-6 animate-enter rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        >
          {{ erro }}
        </p>
      }
    </main>

    @if (store.loteAtivo(); as ativo) {
      <app-barra-compra [lote]="ativo" (comprar)="irParaCheckout($event)" />
    }
  `,
})
export class VitrinePage implements OnInit {
  protected readonly store = inject(BilheteriaStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.carregarVitrine();
  }

  protected irParaCheckout(lote: LoteVitrine): void {
    this.router.navigate(['/checkout'], { queryParams: { lote: lote.id } });
  }
}
