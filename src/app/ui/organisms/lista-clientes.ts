import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginaCompradores } from '../../core/models';
import { Skeleton } from '../atoms/skeleton';

/** Base de compradores do produtor: contato, origem e valor gasto. */
@Component({
  selector: 'app-lista-clientes',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        <span class="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Buscar
        </span>
        <input
          [formControl]="campoBusca"
          type="search"
          inputmode="search"
          placeholder="Nome, e-mail, WhatsApp ou bairro"
          class="w-full rounded-2xl border border-ink/12 bg-ink/[0.03] px-4 py-3.5 text-base text-ink outline-none backdrop-blur-xl placeholder:text-ink-muted/60 focus:border-accent/60"
        />
      </label>

      @if (carregando()) {
        @for (linha of esqueletos; track linha) {
          <app-skeleton class="h-24 w-full" radius="rounded-3xl" />
        }
      } @else if (pagina(); as p) {
        <p class="text-xs text-ink-muted">
          {{ p.total }} {{ p.total === 1 ? 'comprador' : 'compradores' }} na base
        </p>

        @for (cliente of p.itens; track cliente.id) {
          <article
            class="flex animate-enter flex-col gap-2 rounded-3xl border border-ink/10 bg-ink/[0.03] p-4 backdrop-blur-xl"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="font-display text-base font-bold">{{ cliente.nome }}</span>
              <span class="shrink-0 text-xs tabular-nums text-accent">
                {{ cliente.totalGastoCentavos / 100 | currency: 'BRL' }}
              </span>
            </div>

            <div class="flex flex-col gap-0.5 text-xs text-ink-muted">
              <span>{{ cliente.email }}</span>
              <span>{{ formatarWhatsapp(cliente.whatsapp) }}</span>
              <span>{{ cliente.bairro }} · {{ cliente.cidade }}/{{ cliente.uf }}</span>
            </div>

            <div class="flex items-center justify-between gap-3 text-[0.68rem] text-ink-muted">
              <span>
                {{ cliente.ingressosComprados }}
                {{ cliente.ingressosComprados === 1 ? 'ingresso' : 'ingressos' }}
              </span>
              <span>Desde {{ cliente.criadoEm | date: 'dd/MM/yy' }}</span>
            </div>
          </article>
        } @empty {
          <p class="rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink-muted">
            Nenhum comprador encontrado para essa busca.
          </p>
        }

        @if (p.totalPaginas > 1) {
          <div class="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              [class]="classesPaginacao(p.pagina <= 1)"
              [disabled]="p.pagina <= 1"
              (click)="irParaPagina.emit(p.pagina - 1)"
            >
              ← Anterior
            </button>

            <span class="text-xs tabular-nums text-ink-muted">
              {{ p.pagina }} de {{ p.totalPaginas }}
            </span>

            <button
              type="button"
              [class]="classesPaginacao(p.pagina >= p.totalPaginas)"
              [disabled]="p.pagina >= p.totalPaginas"
              (click)="irParaPagina.emit(p.pagina + 1)"
            >
              Próxima →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class ListaClientes {
  private readonly destroyRef = inject(DestroyRef);

  readonly pagina = input<PaginaCompradores | null>(null);
  readonly carregando = input(false);
  readonly buscar = output<string>();
  readonly irParaPagina = output<number>();

  protected readonly esqueletos = [1, 2, 3, 4];
  protected readonly campoBusca = new FormControl('', { nonNullable: true });

  constructor() {
    // Debounce para não disparar uma consulta por tecla digitada.
    this.campoBusca.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((termo) => this.buscar.emit(termo));
  }

  protected formatarWhatsapp(digitos: string): string {
    const d = digitos.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return digitos;
  }

  protected classesPaginacao(bloqueado: boolean): string {
    const base =
      'rounded-2xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors';

    return bloqueado
      ? `${base} border-ink/8 text-ink-muted opacity-40 cursor-not-allowed pointer-events-none`
      : `${base} border-ink/15 text-ink hover:border-accent/50 cursor-pointer`;
  }
}
