import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FATOR_LATENCIA } from '../mocks/latencia';
import { CheckoutRequest } from '../models';
import { BilheteriaStore } from './bilheteria-store';

const REQUISICAO: CheckoutRequest = {
  loteId: 'lote-1',
  quantidade: 2,
  metodo: 'pix',
  comprador: {
    nome: 'Comprador Teste',
    email: 'store@email.com',
    whatsapp: '21999999999',
    cep: '22020000',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
};

/** Deixa a fila de microtasks/timers drenar (o mock resolve com delay 0). */
const aguardar = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('BilheteriaStore', () => {
  let store: BilheteriaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: FATOR_LATENCIA, useValue: 0 }],
    });
    store = TestBed.inject(BilheteriaStore);
  });

  it('liga e desliga o carregando ao buscar a vitrine', async () => {
    expect(store.carregando()).toBeFalse();

    store.carregarVitrine();
    expect(store.carregando()).toBeTrue();

    await aguardar();

    expect(store.carregando()).toBeFalse();
    expect(store.evento()?.nome).toBe('Sunset Vibezz');
    expect(store.loteAtivo()?.id).toBe('lote-1');
    expect(store.acabando()).toBeTrue();
  });

  it('limita a quantidade ao teto por pedido e ao estoque', async () => {
    store.carregarVitrine();
    await aguardar();

    store.definirQuantidade(99);
    expect(store.quantidade()).toBe(6);

    store.definirQuantidade(0);
    expect(store.quantidade()).toBe(1);

    store.definirQuantidade(3);
    expect(store.totalSelecionadoCentavos()).toBe(3 * 6990);
  });

  it('ignora um segundo pagamento disparado durante o processamento', async () => {
    store.carregarVitrine();
    await aguardar();

    const primeira = firstValueFrom(store.finalizarCompra(REQUISICAO));
    expect(store.processandoPagamento()).toBeTrue();

    let segundaEmitiu = false;
    store.finalizarCompra(REQUISICAO).subscribe(() => (segundaEmitiu = true));

    const resposta = await primeira;

    expect(resposta.sucesso).toBeTrue();
    expect(segundaEmitiu).toBeFalse();
    expect(store.processandoPagamento()).toBeFalse();
  });

  it('relê o estoque depois da compra', async () => {
    store.carregarVitrine();
    await aguardar();
    const antes = store.disponivel();

    await firstValueFrom(store.finalizarCompra(REQUISICAO));
    await aguardar();

    expect(store.disponivel()).toBe(antes - REQUISICAO.quantidade);
  });
});
