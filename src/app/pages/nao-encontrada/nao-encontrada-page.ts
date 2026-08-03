import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex flex-col grow items-start justify-center gap-4 px-5 py-20">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Erro 404</p>
      <h1 class="text-3xl font-black">Essa página saiu da pista.</h1>
      <p class="text-ink-muted">O link que você abriu não existe (ou o lote já virou).</p>
      <a
        routerLink="/"
        class="mt-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-night"
      >
        Voltar para o evento
      </a>
    </main>
  `,
})
export class NaoEncontradaPage {}
