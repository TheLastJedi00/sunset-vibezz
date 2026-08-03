import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SecaoAdmin {
  readonly id: string;
  readonly rotulo: string;
  readonly descricao: string;
}

/**
 * Layout do painel do produtor.
 * A navegação vive num aside que entra e sai com as animações padronizadas
 * (`animate-enter-right` / `animate-leave-right`), mantendo a tela livre no mobile.
 */
@Component({
  selector: 'app-admin-template',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header class="sticky top-0 z-30 border-b border-ink/10 bg-night/80 backdrop-blur-xl">
      <div class="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <div class="flex flex-col">
          <a routerLink="/" class="font-display text-xs font-black uppercase tracking-[0.22em]">
            Sunset<span class="text-accent">Vibezz</span>
          </a>
          <span class="text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted">
            Painel do produtor
          </span>
        </div>

        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-2xl border border-ink/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent/50"
          [attr.aria-expanded]="asideAberto()"
          aria-controls="menu-admin"
          (click)="alternarAside()"
        >
          {{ secaoAtual()?.rotulo ?? 'Menu' }}
          <span class="text-accent" aria-hidden="true">☰</span>
        </button>
      </div>
    </header>

    @if (asideMontado()) {
      <div class="fixed inset-0 z-40">
        <button
          type="button"
          class="absolute inset-0 h-full w-full cursor-default bg-night/70 backdrop-blur-sm"
          [class]="asideSaindo() ? 'animate-leave-fade' : 'animate-enter-fade'"
          aria-label="Fechar menu"
          (click)="fecharAside()"
        ></button>

        <aside
          id="menu-admin"
          class="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col gap-2 border-l border-ink/12 bg-primary/45 p-5 backdrop-blur-2xl"
          [class]="asideSaindo() ? 'animate-leave-right' : 'animate-enter-right'"
        >
          <span class="px-1 pb-2 text-[0.68rem] uppercase tracking-[0.2em] text-ink-muted">
            Seções
          </span>

          @for (secao of secoes(); track secao.id) {
            <button type="button" [class]="classesItem(secao.id)" (click)="escolher(secao.id)">
              <span class="font-display text-base font-bold">{{ secao.rotulo }}</span>
              <span class="text-xs text-ink-muted">{{ secao.descricao }}</span>
            </button>
          }

          <a
            routerLink="/"
            class="mt-auto rounded-2xl border border-ink/12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
          >
            Ver a vitrine
          </a>
        </aside>
      </div>
    }

    <main class="mx-auto flex w-full max-w-3xl grow flex-col gap-6 px-5 py-7">
      <ng-content />
    </main>
  `,
})
export class AdminTemplate implements OnDestroy {
  readonly secoes = input.required<readonly SecaoAdmin[]>();
  readonly secaoAtiva = input.required<string>();
  readonly selecionar = output<string>();

  protected readonly asideAberto = signal(false);
  protected readonly asideMontado = signal(false);
  protected readonly asideSaindo = signal(false);

  private static readonly DURACAO_SAIDA = 220;
  private saida: ReturnType<typeof setTimeout> | null = null;

  protected readonly secaoAtual = () =>
    this.secoes().find((secao) => secao.id === this.secaoAtiva()) ?? null;

  constructor() {
    // Mesmo ciclo de montagem dos modais: entra e sai animado.
    effect(() => {
      const aberto = this.asideAberto();

      if (this.saida) {
        clearTimeout(this.saida);
        this.saida = null;
      }

      if (aberto) {
        this.asideSaindo.set(false);
        this.asideMontado.set(true);
        return;
      }

      if (!untracked(this.asideMontado)) {
        return;
      }

      this.asideSaindo.set(true);
      this.saida = setTimeout(() => {
        this.asideMontado.set(false);
        this.asideSaindo.set(false);
      }, AdminTemplate.DURACAO_SAIDA);
    });
  }

  ngOnDestroy(): void {
    if (this.saida) {
      clearTimeout(this.saida);
    }
  }

  protected alternarAside(): void {
    this.asideAberto.update((aberto) => !aberto);
  }

  protected fecharAside(): void {
    this.asideAberto.set(false);
  }

  protected escolher(id: string): void {
    this.selecionar.emit(id);
    this.fecharAside();
  }

  protected classesItem(id: string): string {
    const base =
      'flex cursor-pointer flex-col gap-0.5 rounded-2xl border px-4 py-3 text-left transition-colors';

    return this.secaoAtiva() === id
      ? `${base} border-accent/45 bg-accent/10`
      : `${base} border-ink/10 bg-ink/[0.02] hover:border-ink/25`;
  }
}
