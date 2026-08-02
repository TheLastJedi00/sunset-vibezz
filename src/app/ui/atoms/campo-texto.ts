import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/** Campo de texto do checkout: rótulo, input e mensagem de erro. */
@Component({
  selector: 'app-campo-texto',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label class="flex flex-col gap-2">
      <span class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {{ rotulo() }}
      </span>

      <input
        [formControl]="controle()"
        [type]="tipo()"
        [attr.inputmode]="inputmode()"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="tamanhoMaximo()"
        [attr.aria-invalid]="comErro() ? 'true' : null"
        [placeholder]="placeholder()"
        [class]="classesInput()"
      />

      @if (comErro()) {
        <span class="animate-enter-fade text-xs text-red-300">{{ mensagem() }}</span>
      } @else if (dica()) {
        <span class="text-xs text-ink-muted">{{ dica() }}</span>
      }
    </label>
  `,
})
export class CampoTexto {
  readonly controle = input.required<FormControl<string>>();
  readonly rotulo = input.required<string>();
  readonly tipo = input<'text' | 'email' | 'tel'>('text');
  readonly inputmode = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly placeholder = input('');
  readonly dica = input('');
  readonly tamanhoMaximo = input<number | null>(null);
  readonly mensagens = input<Record<string, string>>({});

  protected comErro(): boolean {
    const controle = this.controle();
    return controle.invalid && (controle.touched || controle.dirty);
  }

  protected mensagem(): string {
    const erros = this.controle().errors ?? {};
    const chave = Object.keys(erros)[0];
    return this.mensagens()[chave] ?? 'Confira este campo.';
  }

  protected classesInput(): string {
    const base =
      'w-full rounded-2xl border bg-ink/[0.03] px-4 py-3.5 text-base text-ink ' +
      'placeholder:text-ink-muted/60 outline-none transition-colors backdrop-blur-xl';

    return this.comErro()
      ? `${base} border-red-400/50 focus:border-red-400`
      : `${base} border-ink/12 focus:border-accent/60`;
  }
}
