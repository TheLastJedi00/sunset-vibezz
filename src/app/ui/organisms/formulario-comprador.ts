import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { Comprador } from '../../core/models';
import { TicketMockService } from '../../core/services/ticket-mock.service';
import { CampoTexto } from '../atoms/campo-texto';
import { Skeleton } from '../atoms/skeleton';

export interface EstadoFormulario {
  readonly valido: boolean;
  readonly dados: Comprador | null;
}

/** Só dígitos — o que vai para o "banco". */
const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Exige nome e sobrenome: evita "João" solto na base de remarketing. */
const nomeCompleto: ValidatorFn = (controle: AbstractControl) => {
  const partes = String(controle.value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return partes.length >= 2 && partes.every((p) => p.length >= 2) ? null : { nomeCompleto: true };
};

function somenteDigitos(minimo: number, maximo = minimo): ValidatorFn {
  return (controle: AbstractControl) => {
    const digitos = apenasDigitos(String(controle.value ?? ''));
    return digitos.length >= minimo && digitos.length <= maximo ? null : { digitos: true };
  };
}

/**
 * Dados essenciais do comprador. O CEP dispara a consulta mockada que preenche
 * bairro/cidade/UF — é daí que sai a inteligência geográfica do painel.
 */
@Component({
  selector: 'app-formulario-comprador',
  imports: [ReactiveFormsModule, CampoTexto, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter' },
  template: `
    <form [formGroup]="formulario" class="flex flex-col gap-5" novalidate>
      <app-campo-texto
        [controle]="formulario.controls.nome"
        rotulo="Nome completo"
        placeholder="Como está no seu documento"
        autocomplete="name"
        [mensagens]="{ required: 'Informe seu nome.', nomeCompleto: 'Escreva nome e sobrenome.' }"
      />

      <app-campo-texto
        [controle]="formulario.controls.email"
        rotulo="E-mail"
        tipo="email"
        inputmode="email"
        autocomplete="email"
        placeholder="voce@email.com"
        dica="É para cá que o ingresso com QR Code será enviado."
        [mensagens]="{ required: 'Informe seu e-mail.', email: 'E-mail inválido.' }"
      />

      <app-campo-texto
        [controle]="formulario.controls.whatsapp"
        rotulo="WhatsApp"
        tipo="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="(21) 99999-9999"
        [tamanhoMaximo]="15"
        [mensagens]="{ required: 'Informe seu WhatsApp.', digitos: 'Inclua DDD e número.' }"
      />

      <app-campo-texto
        [controle]="formulario.controls.cep"
        rotulo="CEP"
        inputmode="numeric"
        autocomplete="postal-code"
        placeholder="00000-000"
        [tamanhoMaximo]="9"
        [mensagens]="{ required: 'Informe seu CEP.', digitos: 'CEP deve ter 8 dígitos.' }"
      />

      @if (consultandoCep()) {
        <div class="flex flex-col gap-2" aria-busy="true">
          <app-skeleton class="h-3 w-20" radius="rounded-full" />
          <app-skeleton class="h-13 w-full" radius="rounded-2xl" />
        </div>
      } @else if (enderecoResolvido()) {
        <div class="flex flex-col gap-5 animate-enter">
          <app-campo-texto
            [controle]="formulario.controls.bairro"
            rotulo="Bairro"
            [mensagens]="{ required: 'Informe o bairro.' }"
          />

          <p class="text-xs text-ink-muted">
            {{ formulario.controls.cidade.value }}/{{ formulario.controls.uf.value }}
            @if (!cepEncontrado()) {
              · não encontramos esse CEP, confira o bairro
            }
          </p>
        </div>
      }
    </form>
  `,
})
export class FormularioComprador {
  private readonly api = inject(TicketMockService);
  private readonly destroyRef = inject(DestroyRef);

  /** Vira `true` quando o usuário tenta avançar: revela os erros pendentes. */
  readonly revelarErros = input(false);
  /** Repopula o formulário quando o usuário volta uma etapa e retorna. */
  readonly valorInicial = input<Comprador | null>(null);
  readonly mudou = output<EstadoFormulario>();

  protected readonly consultandoCep = signal(false);
  protected readonly enderecoResolvido = signal(false);
  protected readonly cepEncontrado = signal(true);

  protected readonly formulario = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nomeCompleto],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    whatsapp: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, somenteDigitos(10, 11)],
    }),
    cep: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, somenteDigitos(8)],
    }),
    bairro: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cidade: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    uf: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.restaurarValorInicial();
    this.aplicarMascaras();
    this.observarCep();

    this.formulario.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.mudou.emit({ valido: this.formulario.valid, dados: this.dados() });
    });

    effect(() => {
      if (this.revelarErros()) {
        this.formulario.markAllAsTouched();
      }
    });
  }

  /** O @switch de etapas destrói este componente; nada do que foi digitado se perde. */
  private restaurarValorInicial(): void {
    const inicial = this.valorInicial();
    if (!inicial) {
      return;
    }

    this.formulario.setValue({
      ...inicial,
      whatsapp: formatarTelefone(inicial.whatsapp),
      cep: formatarCep(inicial.cep),
    });
    this.enderecoResolvido.set(true);
  }

  private dados(): Comprador | null {
    if (this.formulario.invalid) {
      return null;
    }

    const valor = this.formulario.getRawValue();
    return {
      nome: valor.nome.trim(),
      email: valor.email.trim().toLowerCase(),
      whatsapp: apenasDigitos(valor.whatsapp),
      cep: apenasDigitos(valor.cep),
      bairro: valor.bairro.trim(),
      cidade: valor.cidade.trim(),
      uf: valor.uf.trim().toUpperCase(),
    };
  }

  /** Máscaras aplicadas na digitação, sem sujar o dado enviado ao backend. */
  private aplicarMascaras(): void {
    const { whatsapp, cep } = this.formulario.controls;

    whatsapp.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
      const formatado = formatarTelefone(valor);
      if (formatado !== valor) {
        whatsapp.setValue(formatado, { emitEvent: false });
      }
    });

    cep.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((valor) => {
      const formatado = formatarCep(valor);
      if (formatado !== valor) {
        cep.setValue(formatado, { emitEvent: false });
      }
    });
  }

  /** Com 8 dígitos, busca o endereço e preenche bairro/cidade/UF. */
  private observarCep(): void {
    this.formulario.controls.cep.valueChanges
      .pipe(
        debounceTime(350),
        map(apenasDigitos),
        distinctUntilChanged(),
        filter((digitos) => digitos.length === 8),
        switchMap((digitos) => {
          this.consultandoCep.set(true);
          return this.api.consultarCep(digitos);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((endereco) => {
        this.consultandoCep.set(false);
        this.enderecoResolvido.set(true);
        this.cepEncontrado.set(endereco.encontrado);

        this.formulario.patchValue(
          { bairro: endereco.bairro, cidade: endereco.cidade, uf: endereco.uf },
          { emitEvent: false },
        );
        this.mudou.emit({ valido: this.formulario.valid, dados: this.dados() });
      });
  }
}

/** (21) 99999-9999 */
function formatarTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 00000-000 */
function formatarCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}
