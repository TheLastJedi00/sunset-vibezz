import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Evento, Ingresso } from '../../core/models';
import { QrCode } from '../atoms/qr-code';

/** Ingresso digital entregue após a aprovação — o mesmo que vai por e-mail. */
@Component({
  selector: 'app-ingresso-digital',
  imports: [CurrencyPipe, DatePipe, QrCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter' },
  template: `
    @let i = ingresso();

    <article
      class="flex flex-col overflow-hidden rounded-3xl border border-ink/12 bg-primary/35 backdrop-blur-xl"
    >
      <div class="flex flex-col gap-1 px-5 pt-5">
        <span class="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-accent">
          Ingresso digital
        </span>
        <h3 class="font-display text-xl font-black uppercase tracking-tight">
          {{ i.eventoNome }}
        </h3>
        @if (evento(); as ev) {
          <p class="text-xs text-ink-muted">
            {{ ev.dataInicio | date: "EEEE, d 'de' MMMM · HH:mm" }} · {{ ev.local.nome }}
          </p>
        }
      </div>

      <div class="mx-auto my-5 w-40">
        <app-qr-code
          [payload]="i.qrCodePayload"
          [descricao]="'QR Code do ingresso ' + i.codigo"
        />
      </div>

      <!-- Serrilha do canhoto -->
      <div class="relative h-5">
        <span class="absolute inset-x-5 top-1/2 border-t border-dashed border-ink/20"></span>
        <span class="absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-night"></span>
        <span
          class="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-night"
        ></span>
      </div>

      <dl class="grid grid-cols-2 gap-4 px-5 pb-5">
        <div class="flex flex-col gap-0.5">
          <dt class="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">Código</dt>
          <dd class="font-display text-sm font-bold tabular-nums">{{ i.codigo }}</dd>
        </div>

        <div class="flex flex-col gap-0.5">
          <dt class="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">Lote</dt>
          <dd class="font-display text-sm font-bold">{{ i.loteNome }}</dd>
        </div>

        <div class="col-span-2 flex flex-col gap-0.5">
          <dt class="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">Titular</dt>
          <dd class="text-sm">{{ i.nomeComprador }}</dd>
        </div>

        <div class="flex flex-col gap-0.5">
          <dt class="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">Valor pago</dt>
          <dd class="text-sm tabular-nums">
            {{ i.precoPagoCentavos / 100 | currency: 'BRL' }}
          </dd>
        </div>

        <div class="flex flex-col gap-0.5">
          <dt class="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">Emitido em</dt>
          <dd class="text-sm tabular-nums">{{ i.emitidoEm | date: 'dd/MM/yy HH:mm' }}</dd>
        </div>
      </dl>
    </article>
  `,
})
export class IngressoDigital {
  readonly ingresso = input.required<Ingresso>();
  readonly evento = input<Evento | null>(null);
}
