import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DadosCartao, MetodoPagamento } from '../../core/models';
import { CampoTexto } from '../atoms/campo-texto';

export interface EstadoPagamento {
  readonly metodo: MetodoPagamento;
  readonly cartao: DadosCartao | null;
  readonly valido: boolean;
}

const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

function comprimentoDeDigitos(minimo: number, maximo = minimo): ValidatorFn {
  return (controle: AbstractControl) => {
    const digitos = apenasDigitos(String(controle.value ?? ''));
    return digitos.length >= minimo && digitos.length <= maximo ? null : { digitos: true };
  };
}

/** MM/AA no futuro. */
const validadeFutura: ValidatorFn = (controle: AbstractControl) => {
  const digitos = apenasDigitos(String(controle.value ?? ''));
  if (digitos.length !== 4) {
    return { digitos: true };
  }

  const mes = Number(digitos.slice(0, 2));
  const ano = 2000 + Number(digitos.slice(2));
  if (mes < 1 || mes > 12) {
    return { mes: true };
  }

  const hoje = new Date();
  const ultimoDia = new Date(ano, mes, 0, 23, 59, 59);
  return ultimoDia >= hoje ? null : { vencido: true };
};

/**
 * Escolha do meio de pagamento.
 * PIX é o caminho curto (aprovação imediata); cartão abre o formulário completo.
 */
@Component({
  selector: 'app-selecao-pagamento',
  imports: [CurrencyPipe, ReactiveFormsModule, CampoTexto],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter' },
  template: `
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-3" role="radiogroup" aria-label="Forma de pagamento">
        <button type="button" [class]="classesOpcao('pix')" role="radio"
          [attr.aria-checked]="metodo() === 'pix'" (click)="selecionar('pix')">
          <span class="flex flex-col gap-1 text-left">
            <span class="font-display text-base font-bold">PIX</span>
            <span class="text-xs text-ink-muted">Aprovação na hora, ingresso liberado na hora.</span>
          </span>
          <span [class]="classesMarcador('pix')"></span>
        </button>

        <button type="button" [class]="classesOpcao('cartao')" role="radio"
          [attr.aria-checked]="metodo() === 'cartao'" (click)="selecionar('cartao')">
          <span class="flex flex-col gap-1 text-left">
            <span class="font-display text-base font-bold">Cartão de crédito</span>
            <span class="text-xs text-ink-muted">Em até {{ maximoParcelas }}x sem juros.</span>
          </span>
          <span [class]="classesMarcador('cartao')"></span>
        </button>
      </div>

      @if (metodo() === 'cartao') {
        <form [formGroup]="formulario" class="flex animate-enter flex-col gap-5" novalidate>
          <app-campo-texto
            [controle]="formulario.controls.numero"
            rotulo="Número do cartão"
            inputmode="numeric"
            autocomplete="cc-number"
            placeholder="0000 0000 0000 0000"
            [tamanhoMaximo]="19"
            [mensagens]="{ required: 'Informe o número.', digitos: 'Número inválido.' }"
          />

          <app-campo-texto
            [controle]="formulario.controls.titular"
            rotulo="Nome impresso no cartão"
            autocomplete="cc-name"
            placeholder="COMO ESTÁ NO CARTÃO"
            [mensagens]="{ required: 'Informe o titular.', minlength: 'Nome muito curto.' }"
          />

          <app-campo-texto
            [controle]="formulario.controls.validade"
            rotulo="Validade"
            inputmode="numeric"
            autocomplete="cc-exp"
            placeholder="MM/AA"
            [tamanhoMaximo]="5"
            [mensagens]="{
              required: 'Informe a validade.',
              digitos: 'Use MM/AA.',
              mes: 'Mês inválido.',
              vencido: 'Cartão vencido.',
            }"
          />

          <app-campo-texto
            [controle]="formulario.controls.cvv"
            rotulo="CVV"
            inputmode="numeric"
            autocomplete="cc-csc"
            placeholder="000"
            [tamanhoMaximo]="4"
            [mensagens]="{ required: 'Informe o CVV.', digitos: 'CVV inválido.' }"
          />

          <label class="flex flex-col gap-2">
            <span class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Parcelas
            </span>
            <select
              [formControl]="formulario.controls.parcelas"
              class="w-full appearance-none rounded-2xl border border-ink/12 bg-ink/[0.03] px-4 py-3.5 text-base text-ink outline-none backdrop-blur-xl focus:border-accent/60"
            >
              @for (opcao of opcoesDeParcela(); track opcao.parcelas) {
                <option [value]="opcao.parcelas" class="bg-night">
                  {{ opcao.parcelas }}x de {{ opcao.valorCentavos / 100 | currency: 'BRL' }} sem
                  juros
                </option>
              }
            </select>
          </label>
        </form>
      } @else {
        <p
          class="rounded-2xl border border-ink/10 bg-ink/[0.03] px-4 py-3.5 text-sm text-ink-muted"
        >
          Ao confirmar, geramos o código PIX e liberamos seu ingresso assim que o pagamento cair.
        </p>
      }
    </div>
  `,
})
export class SelecaoPagamento {
  private readonly destroyRef = inject(DestroyRef);

  readonly totalCentavos = input.required<number>();
  readonly revelarErros = input(false);
  readonly mudou = output<EstadoPagamento>();

  protected readonly metodo = signal<MetodoPagamento>('pix');
  protected readonly maximoParcelas = 6;

  protected readonly formulario = new FormGroup({
    numero: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, comprimentoDeDigitos(13, 16)],
    }),
    titular: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
    validade: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, validadeFutura],
    }),
    cvv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, comprimentoDeDigitos(3, 4)],
    }),
    parcelas: new FormControl(1, { nonNullable: true }),
  });

  /** Parcelamento calculado sobre o total real do pedido. */
  protected readonly opcoesDeParcela = computed(() =>
    Array.from({ length: this.maximoParcelas }, (_, i) => {
      const parcelas = i + 1;
      return { parcelas, valorCentavos: Math.round(this.totalCentavos() / parcelas) };
    }),
  );

  constructor() {
    this.aplicarMascaras();

    this.formulario.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitir();
    });

    effect(() => {
      if (this.revelarErros() && this.metodo() === 'cartao') {
        this.formulario.markAllAsTouched();
      }
    });
  }

  protected selecionar(metodo: MetodoPagamento): void {
    this.metodo.set(metodo);
    this.emitir();
  }

  protected classesOpcao(metodo: MetodoPagamento): string {
    const base =
      'flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-colors backdrop-blur-xl';

    return this.metodo() === metodo
      ? `${base} border-accent/50 bg-accent/8`
      : `${base} border-ink/12 bg-ink/[0.02] hover:border-ink/25`;
  }

  protected classesMarcador(metodo: MetodoPagamento): string {
    const base = 'size-5 shrink-0 rounded-full border-2 transition-colors';
    return this.metodo() === metodo
      ? `${base} border-accent bg-accent shadow-[0_0_0_4px_rgb(248_126_58/0.18)]`
      : `${base} border-ink/25`;
  }

  private emitir(): void {
    const cartao = this.metodo() === 'cartao' ? this.dadosDoCartao() : null;

    this.mudou.emit({
      metodo: this.metodo(),
      cartao,
      valido: this.metodo() === 'pix' || this.formulario.valid,
    });
  }

  private dadosDoCartao(): DadosCartao {
    const valor = this.formulario.getRawValue();
    return {
      numero: apenasDigitos(valor.numero),
      titular: valor.titular.trim().toUpperCase(),
      validade: valor.validade,
      cvv: apenasDigitos(valor.cvv),
      parcelas: Number(valor.parcelas),
    };
  }

  private aplicarMascaras(): void {
    const { numero, validade } = this.formulario.controls;

    numero.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
      const formatado = apenasDigitos(valor)
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim();
      if (formatado !== valor) {
        numero.setValue(formatado, { emitEvent: false });
      }
    });

    validade.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
      const d = apenasDigitos(valor).slice(0, 4);
      const formatado = d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
      if (formatado !== valor) {
        validade.setValue(formatado, { emitEvent: false });
      }
    });
  }
}
