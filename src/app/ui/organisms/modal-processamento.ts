import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';

/** Etapas exibidas enquanto o pagamento é processado (2s–3s no mock). */
const ETAPAS = [
  'Validando seus dados...',
  'Autorizando o pagamento...',
  'Emitindo seu ingresso digital...',
] as const;

/**
 * Overlay de processamento do checkout.
 * Glassmorphism sobre `#00000A` translúcido, entrada com `animate-enter` e
 * saída com `animate-leave`. Enquanto estiver visível, nada atrás é clicável —
 * é a barreira final contra pagamento duplicado.
 */
@Component({
  selector: 'app-modal-processamento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (montado()) {
      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-night/70 p-4 backdrop-blur-xl sm:items-center"
        [class]="saindo() ? 'animate-leave-fade' : 'animate-enter-fade'"
        role="alertdialog"
        aria-live="assertive"
        aria-busy="true"
        [attr.aria-label]="titulo()"
      >
        <div
          class="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-ink/12 bg-primary/40 px-6 py-8 backdrop-blur-2xl shadow-[0_30px_80px_-20px_#000]"
          [class]="saindo() ? 'animate-leave' : 'animate-enter'"
        >
          <div class="relative flex size-16 items-center justify-center">
            <span class="absolute inset-0 rounded-full border border-accent/20"></span>
            <span
              class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent"
            ></span>
            <span class="size-2 animate-breathe rounded-full bg-accent"></span>
          </div>

          <div class="flex flex-col items-center gap-2 text-center">
            <h2 class="font-display text-lg font-black tracking-tight">{{ titulo() }}</h2>
            <p class="text-sm text-ink-muted">{{ etapaAtual() }}</p>
          </div>

          <!-- Passos: dão a sensação de progresso durante a espera -->
          <ol class="flex w-full items-center gap-2">
            @for (etapa of etapas; track etapa; let i = $index) {
              <li
                class="h-1 flex-1 rounded-full transition-colors duration-500"
                [class]="i <= indice() ? 'bg-accent' : 'bg-ink/12'"
              ></li>
            }
          </ol>

          <p class="text-center text-xs text-ink-muted">
            Não feche esta tela nem toque em voltar — a cobrança pode duplicar.
          </p>
        </div>
      </div>
    }
  `,
})
export class ModalProcessamento implements OnDestroy {
  readonly visivel = input(false);
  readonly titulo = input('Processando pagamento');

  protected readonly etapas = ETAPAS;
  protected readonly montado = signal(false);
  protected readonly saindo = signal(false);
  protected readonly indice = signal(0);

  protected readonly etapaAtual = () => ETAPAS[this.indice()];

  private static readonly DURACAO_SAIDA = 200;
  private static readonly INTERVALO_ETAPA = 900;

  private saida: ReturnType<typeof setTimeout> | null = null;
  private avanco: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const visivel = this.visivel();
      this.limparTemporizadores();

      if (visivel) {
        this.saindo.set(false);
        this.indice.set(0);
        this.montado.set(true);
        this.avanco = setInterval(() => {
          this.indice.update((atual) => Math.min(atual + 1, ETAPAS.length - 1));
        }, ModalProcessamento.INTERVALO_ETAPA);
        return;
      }

      if (!untracked(this.montado)) {
        return;
      }

      // Fecha no último passo para não parecer que travou no meio.
      this.indice.set(ETAPAS.length - 1);
      this.saindo.set(true);
      this.saida = setTimeout(() => {
        this.montado.set(false);
        this.saindo.set(false);
      }, ModalProcessamento.DURACAO_SAIDA);
    });
  }

  ngOnDestroy(): void {
    this.limparTemporizadores();
  }

  private limparTemporizadores(): void {
    if (this.saida) {
      clearTimeout(this.saida);
      this.saida = null;
    }
    if (this.avanco) {
      clearInterval(this.avanco);
      this.avanco = null;
    }
  }
}
