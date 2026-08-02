import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PainelStore } from '../../core/state/painel-store';
import { DashboardVendas } from '../../ui/organisms/dashboard-vendas';
import { LoadingFullscreen } from '../../ui/organisms/loading-fullscreen';
import { AdminTemplate, SecaoAdmin } from '../../ui/templates/admin-template';

const SECOES: readonly SecaoAdmin[] = [
  { id: 'visao-geral', rotulo: 'Visão geral', descricao: 'Vendas, receita e lote ativo' },
  { id: 'regioes', rotulo: 'Regiões', descricao: 'De onde vêm os compradores' },
  { id: 'clientes', rotulo: 'Clientes', descricao: 'Base para remarketing' },
];

@Component({
  selector: 'app-admin-page',
  imports: [AdminTemplate, LoadingFullscreen, DashboardVendas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-loading-fullscreen [visivel]="painel.carregando()" mensagem="Consolidando as vendas..." />

    <app-admin-template
      [secoes]="secoes"
      [secaoAtiva]="secao()"
      (selecionar)="secao.set($event)"
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
          <p class="text-sm text-ink-muted">Inteligência geográfica (próxima tarefa).</p>
        }
        @case ('clientes') {
          <p class="text-sm text-ink-muted">Base de clientes (próxima tarefa).</p>
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
}
