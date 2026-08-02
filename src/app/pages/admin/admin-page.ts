import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PainelStore } from '../../core/state/painel-store';
import { DashboardVendas } from '../../ui/organisms/dashboard-vendas';
import { LoadingFullscreen } from '../../ui/organisms/loading-fullscreen';
import { ListaClientes } from '../../ui/organisms/lista-clientes';
import { RelatorioRegioes } from '../../ui/organisms/relatorio-regioes';
import { AdminTemplate, SecaoAdmin } from '../../ui/templates/admin-template';

const SECOES: readonly SecaoAdmin[] = [
  { id: 'visao-geral', rotulo: 'Visão geral', descricao: 'Vendas, receita e lote ativo' },
  { id: 'regioes', rotulo: 'Regiões', descricao: 'De onde vêm os compradores' },
  { id: 'clientes', rotulo: 'Clientes', descricao: 'Base para remarketing' },
];

@Component({
  selector: 'app-admin-page',
  imports: [AdminTemplate, LoadingFullscreen, DashboardVendas, RelatorioRegioes, ListaClientes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-loading-fullscreen [visivel]="painel.carregando()" mensagem="Consolidando as vendas..." />

    <app-admin-template
      [secoes]="secoes"
      [secaoAtiva]="secao()"
      (selecionar)="trocarSecao($event)"
    >
      <div class="flex flex-col gap-2">
        <h1 class="font-display text-2xl font-black tracking-tight">{{ tituloDaSecao() }}</h1>
        <p class="text-sm text-ink-muted">{{ descricaoDaSecao() }}</p>
      </div>

      @switch (secao()) {
        @case ('visao-geral') {
          <app-dashboard-vendas
            [resumo]="painel.resumo()"
            [desempenho]="painel.desempenho()"
            [ocupacao]="painel.ocupacao()"
            [carregando]="painel.carregando()"
          />
        }
        @case ('regioes') {
          <app-relatorio-regioes
            [regioes]="painel.regioes()"
            [carregando]="painel.carregandoRegioes()"
          />
        }
        @case ('clientes') {
          <app-lista-clientes
            [pagina]="painel.clientes()"
            [carregando]="painel.carregandoClientes()"
            (buscar)="painel.carregarClientes({ busca: $event, pagina: 1 })"
            (irParaPagina)="painel.carregarClientes({ pagina: $event })"
          />
        }
      }
    </app-admin-template>
  `,
})
export class AdminPage implements OnInit {
  protected readonly painel = inject(PainelStore);

  protected readonly secoes = SECOES;
  protected readonly secao = signal<string>('visao-geral');

  protected readonly tituloDaSecao = computed(
    () => SECOES.find((s) => s.id === this.secao())?.rotulo ?? '',
  );
  protected readonly descricaoDaSecao = computed(
    () => SECOES.find((s) => s.id === this.secao())?.descricao ?? '',
  );

  ngOnInit(): void {
    this.painel.carregarDashboard();
  }

  /** Cada seção busca seus dados na primeira visita — nada é carregado à toa. */
  protected trocarSecao(id: string): void {
    this.secao.set(id);

    if (id === 'regioes') {
      this.painel.carregarRegioes();
    }

    if (id === 'clientes' && !this.painel.clientes()) {
      this.painel.carregarClientes({ pagina: 1 });
    }
  }
}
