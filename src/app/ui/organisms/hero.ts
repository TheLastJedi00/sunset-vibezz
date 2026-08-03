import { DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Evento } from '../../core/models';
import { Badge } from '../atoms/badge';

/** Vitrine do evento: identidade visual, data, local e line-up. */
@Component({
  selector: 'app-hero',
  imports: [DatePipe, UpperCasePipe, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-enter' },
  template: `
    @let ev = evento();

    <section class="flex flex-col gap-7 px-5 pt-8 pb-4">
      <app-badge tone="accent" [dot]="true" [pulse]="true">
        {{ ev.dataInicio | date: "d 'de' MMM" }} · {{ ev.local.cidade }}
      </app-badge>

      <div class="flex flex-col gap-4">
        <h1
          class="font-display text-[clamp(3rem,17vw,6rem)] font-black uppercase leading-[0.82] text-ink"
        >
          @for (parte of nomeEmLinhas(); track parte) {
            <span class="block">{{ parte }}</span>
          }
        </h1>

        <p
          class="font-display text-sm font-bold uppercase tracking-[0.34em] text-accent sm:text-base"
        >
          {{ ev.subtitulo | uppercase }}
        </p>
      </div>

      <p class="max-w-prose text-[0.975rem] leading-relaxed text-ink-muted">
        {{ ev.descricao }}
      </p>

      <!-- Painel de vidro com os dados duros do evento -->
      <dl
        class="flex flex-col divide-y divide-ink/8 rounded-3xl border border-ink/10 bg-ink/[0.035] px-5 backdrop-blur-xl"
      >
        <div class="flex flex-col gap-1 py-4">
          <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Quando
          </dt>
          <dd class="font-display text-lg font-bold">
            {{ ev.dataInicio | date: "EEEE, d 'de' MMMM" }}
          </dd>
          <dd class="text-sm text-ink-muted">
            {{ ev.dataInicio | date: 'HH:mm' }} às {{ ev.dataFim | date: 'HH:mm' }} · vai até o
            nascer do sol
          </dd>
        </div>

        <div class="flex flex-col gap-1 py-4">
          <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Onde
          </dt>
          <dd class="font-display text-lg font-bold">{{ ev.local.nome }}</dd>
          <dd class="text-sm text-ink-muted">
            {{ ev.local.endereco }} · {{ ev.local.cidade }}/{{ ev.local.uf }}
          </dd>
        </div>

        <div class="flex flex-col gap-1 py-4">
          <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Classificação
          </dt>
          <dd class="font-display text-lg font-bold">{{ ev.classificacaoEtaria }}</dd>
          <dd class="text-sm text-ink-muted">Documento com foto obrigatório na portaria.</dd>
        </div>
      </dl>

      <!-- Line-up -->
      <div class="flex flex-col gap-3">
        <h2 class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Line-up
        </h2>

        <ul class="flex flex-col gap-2">
          @for (atracao of ev.atracoes; track atracao.nome) {
            <li
              class="flex items-baseline justify-between gap-4 rounded-2xl px-4 py-3"
              [class]="
                atracao.destaque
                  ? 'border border-accent/25 bg-accent/8'
                  : 'border border-ink/8 bg-ink/[0.02]'
              "
            >
              <span
                class="font-display font-bold uppercase tracking-wide"
                [class]="atracao.destaque ? 'text-accent' : 'text-ink'"
              >
                {{ atracao.nome }}
              </span>
              <span class="shrink-0 text-sm tabular-nums text-ink-muted">{{ atracao.horario }}</span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Hero {
  readonly evento = input.required<Evento>();

  /** "Sunset Vibezz" vira duas linhas para o título ocupar a tela no mobile. */
  protected readonly nomeEmLinhas = computed(() => this.evento().nome.split(' '));
}
