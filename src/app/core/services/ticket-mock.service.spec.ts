import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FATOR_LATENCIA } from '../mocks/latencia';
import { CheckoutRequest } from '../models';
import { TicketMockService } from './ticket-mock.service';

function pedido(loteId: string, quantidade: number, email: string): CheckoutRequest {
  return {
    loteId,
    quantidade,
    metodo: 'pix',
    comprador: {
      nome: 'Comprador Teste',
      email,
      whatsapp: '21999999999',
      cep: '22020000',
      bairro: 'Copacabana',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
    },
  };
}

describe('TicketMockService', () => {
  let servico: TicketMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        // Sem espera artificial: o comportamento testado é o de estoque, não o de UX.
        { provide: FATOR_LATENCIA, useValue: 0 },
        TicketMockService,
      ],
    });
    servico = TestBed.inject(TicketMockService);
  });

  it('expõe o lote ativo com os dados de urgência', async () => {
    const ativo = await firstValueFrom(servico.obterLoteAtivo());

    expect(ativo).toBeTruthy();
    expect(ativo!.id).toBe('lote-1');
    expect(ativo!.disponivel).toBe(18);
    expect(ativo!.acabando).toBeTrue();
  });

  it('nunca vende mais do que o limite do lote em compras simultâneas', async () => {
    // 4 checkouts disparados juntos para 18 ingressos disponíveis (6 cada).
    const respostas = await Promise.all(
      Array.from({ length: 4 }, (_, i) =>
        firstValueFrom(servico.processarCheckout(pedido('lote-1', 6, `simultaneo${i}@email.com`))),
      ),
    );

    const aprovados = respostas.filter((r) => r.sucesso);
    const recusados = respostas.filter((r) => !r.sucesso);

    expect(aprovados.length).toBe(3);
    expect(recusados.length).toBe(1);
    expect(recusados[0].motivoFalha).toBe('lote_encerrado');

    const lotes = await firstValueFrom(servico.obterLotes());
    const lote1 = lotes.find((l) => l.id === 'lote-1')!;

    expect(lote1.quantidadeVendida).toBe(lote1.quantidadeTotal);
    expect(lote1.status).toBe('esgotado');
  });

  it('vira automaticamente para o próximo lote quando o atual esgota', async () => {
    await firstValueFrom(servico.processarCheckout(pedido('lote-1', 6, 'a@email.com')));
    await firstValueFrom(servico.processarCheckout(pedido('lote-1', 6, 'b@email.com')));
    await firstValueFrom(servico.processarCheckout(pedido('lote-1', 6, 'c@email.com')));

    const ativo = await firstValueFrom(servico.obterLoteAtivo());

    expect(ativo!.id).toBe('lote-2');
    expect(ativo!.status).toBe('ativo');
    expect(ativo!.disponivel).toBe(200);
  });

  it('recusa o pagamento e devolve o estoque quando o cartão é negado', async () => {
    const resposta = await firstValueFrom(
      servico.processarCheckout({
        ...pedido('lote-1', 2, 'recusado@email.com'),
        metodo: 'cartao',
        cartao: {
          numero: '4111 1111 1111 0000',
          titular: 'COMPRADOR TESTE',
          validade: '12/30',
          cvv: '123',
          parcelas: 1,
        },
      }),
    );

    expect(resposta.sucesso).toBeFalse();
    expect(resposta.motivoFalha).toBe('pagamento_recusado');

    // Estoque intacto: a reserva foi desfeita.
    const ativo = await firstValueFrom(servico.obterLoteAtivo());
    expect(ativo!.disponivel).toBe(18);
  });

  it('bloqueia pedidos acima do limite por compra', async () => {
    const resposta = await firstValueFrom(
      servico.processarCheckout(pedido('lote-1', 12, 'cambista@email.com')),
    );

    expect(resposta.sucesso).toBeFalse();
    expect(resposta.motivoFalha).toBe('erro_inesperado');
  });

  it('emite um ingresso com QR Code por unidade comprada', async () => {
    const resposta = await firstValueFrom(
      servico.processarCheckout(pedido('lote-1', 2, 'ingressos@email.com')),
    );

    expect(resposta.sucesso).toBeTrue();
    expect(resposta.ingressos.length).toBe(2);
    expect(resposta.ingressos[0].qrCodePayload).toContain(resposta.ingressos[0].codigo);
    expect(resposta.emailEnviadoPara).toBe('ingressos@email.com');
    expect(resposta.pixCopiaECola).toBeTruthy();
  });
});
