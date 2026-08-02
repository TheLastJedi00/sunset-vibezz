import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BilheteriaStore } from '../../core/state/bilheteria-store';
import { Button } from '../../ui/atoms/button';
import { SeletorQuantidade } from '../../ui/molecules/seletor-quantidade';
import { LoadingFullscreen } from '../../ui/organisms/loading-fullscreen';
import { CheckoutTemplate } from '../../ui/templates/checkout-template';

const PASSOS = ['Ingressos', 'Seus dados', 'Pagamento'] as const;

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, CheckoutTemplate, SeletorQuantidade, Button, LoadingFullscreen],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-loading-fullscreen
      [visivel]="store.carregando()"
      mensagem="Reservando sua vaga no lote atual..."
    />

    <app-checkout-template
      [passos]="passos"
      [passoAtual]="passo()"
      [titulo]="titulo()"
      [subtitulo]="subtitulo()"
      (voltar)="voltarEtapa()"
    >
      @let lote = store.loteAtivo();

      @if (lote) {
        @switch (passo()) {
          @case (1) {
            <app-seletor-quantidade
              [valor]="store.quantidade()"
              [maximo]="store.maximoPorPedido()"
              (alterar)="store.definirQuantidade($event)"
            />

            <div
              class="flex flex-col gap-3 rounded-3xl border border-accent/25 bg-primary/30 p-5 backdrop-blur-xl"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-ink-muted">{{ lote.nome }} · unitário</span>
                <span class="tabular-nums">{{ lote.totalCentavos / 100 | currency: 'BRL' }}</span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-ink-muted">Taxa de conveniência</span>
                <span class="text-sm font-semibold text-accent">Isento</span>
              </div>

              <div class="h-px w-full bg-ink/10"></div>

              <div class="flex items-end justify-between gap-4">
                <span class="text-sm text-ink-muted">
                  Total ({{ store.quantidade() }}
                  {{ store.quantidade() === 1 ? 'ingresso' : 'ingressos' }})
                </span>
                <span class="font-display text-3xl font-black tabular-nums text-accent">
                  {{ store.totalSelecionadoCentavos() / 100 | currency: 'BRL' }}
                </span>
              </div>
            </div>

            @if (lote.acabando) {
              <p
                class="animate-enter rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-soft"
                role="status"
              >
                Restam {{ lote.disponivel }} ingressos neste lote. Finalize antes da virada.
              </p>
            }
          }

          @case (2) {
            <p class="text-sm text-ink-muted">Formulário do comprador (próxima tarefa).</p>
          }

          @case (3) {
            <p class="text-sm text-ink-muted">Seleção de pagamento (próxima tarefa).</p>
          }
        }

      } @else if (store.vitrineCarregada()) {
        <p class="rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink-muted">
          Não há lote em venda no momento.
        </p>
      }

      <!-- Direto no slot do rodapé: projeção por seletor não atravessa @if -->
      <app-button
        rodape
        size="lg"
        [variant]="temLoteAtivo() ? 'accent' : 'outline'"
        (pressed)="acaoDoRodape()"
      >
        {{ rotuloDoRodape() }}
      </app-button>
    </app-checkout-template>
  `,
})
export class CheckoutPage implements OnInit {
  protected readonly store = inject(BilheteriaStore);
  private readonly router = inject(Router);

  protected readonly passos = PASSOS;
  protected readonly passo = signal(1);

  protected readonly titulo = computed(() =>
    ({
      1: 'Escolha seus ingressos',
      2: 'Seus dados',
      3: 'Pagamento',
    })[this.passo()] ?? '',
  );

  protected readonly subtitulo = computed(() =>
    ({
      1: 'Lote ativo agora, sem taxa de conveniência.',
      2: 'Usamos esses dados só para enviar o ingresso e avisar de mudanças.',
      3: 'Pagamento processado direto na conta do produtor.',
    })[this.passo()] ?? '',
  );

  protected readonly temLoteAtivo = computed(() => this.store.loteAtivo() !== null);

  protected readonly rotuloDoRodape = computed(() => {
    if (!this.temLoteAtivo()) {
      return 'Voltar para o evento';
    }
    return this.passo() === this.passos.length ? 'Pagar agora' : 'Continuar';
  });

  ngOnInit(): void {
    this.store.carregarVitrine();
  }

  protected acaoDoRodape(): void {
    if (!this.temLoteAtivo()) {
      this.irParaVitrine();
      return;
    }
    this.avancarEtapa();
  }

  protected avancarEtapa(): void {
    if (this.passo() < this.passos.length) {
      this.passo.update((atual) => atual + 1);
    }
  }

  protected voltarEtapa(): void {
    if (this.passo() === 1) {
      this.irParaVitrine();
      return;
    }
    this.passo.update((atual) => atual - 1);
  }

  protected irParaVitrine(): void {
    this.router.navigate(['/']);
  }
}
