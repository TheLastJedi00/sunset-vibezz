import { Injectable, inject } from '@angular/core';
import { Observable, defer, map, of } from 'rxjs';
import {
  CEPS_MOCK,
  CEP_PADRAO,
  COMPRADORES_MOCK,
  EVENTO_MOCK,
  GATILHO_ESCASSEZ,
  LIMITE_POR_PEDIDO,
  LOTES_MOCK,
} from '../mocks/dados-mock';
import { FATOR_LATENCIA, LATENCIA_BUSCA, LATENCIA_CRITICA, comLatencia } from '../mocks/latencia';
import {
  CheckoutRequest,
  CheckoutResponse,
  CompradorRegistro,
  ConsultaCompradores,
  DesempenhoLote,
  EnderecoPorCep,
  Evento,
  Ingresso,
  Lote,
  LoteVitrine,
  MotivoFalha,
  PaginaCompradores,
  RegiaoCompradores,
  ResumoVendas,
} from '../models';

/** Resultado da reserva síncrona de estoque feita antes de "cobrar". */
interface Reserva {
  readonly ok: boolean;
  readonly lote?: Lote;
  readonly quantidade: number;
  readonly motivo?: MotivoFalha;
  readonly mensagem?: string;
}

/**
 * Backend temporário da aplicação.
 * Mantém o estoque em memória e responde com os mesmos contratos previstos para
 * o Supabase/Cloud Functions — a troca futura não deve tocar em componente algum.
 */
@Injectable({ providedIn: 'root' })
export class TicketMockService {
  /** Cópia mutável: as vendas do mock alteram este estado durante a sessão. */
  private lotes: Lote[] = LOTES_MOCK.map((lote) => ({ ...lote }));

  private compradores: CompradorRegistro[] = COMPRADORES_MOCK.map((c) => ({ ...c }));

  private sequencialPedido = 0;

  /** Testes injetam 0 para eliminar a espera artificial. */
  private readonly fator = inject(FATOR_LATENCIA);

  obterEvento(): Observable<Evento> {
    return of(EVENTO_MOCK).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /**
   * `defer` garante que o snapshot do estoque seja tirado no momento da
   * inscrição — e não quando o Observable foi criado —, então uma releitura
   * feita depois de uma compra já enxerga a virada de lote.
   */
  obterLotes(): Observable<readonly LoteVitrine[]> {
    return defer(() => of(this.instantaneoDosLotes())).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /** Lote que está vendendo agora — `null` quando tudo esgotou. */
  obterLoteAtivo(): Observable<LoteVitrine | null> {
    return defer(() =>
      of(this.instantaneoDosLotes().find((lote) => lote.status === 'ativo') ?? null),
    ).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /**
   * Consulta de CEP (papel do ViaCEP no MVP real).
   * Preenche bairro/cidade/UF sozinho e é o que alimenta a inteligência
   * geográfica do painel do produtor.
   */
  consultarCep(cep: string): Observable<EnderecoPorCep> {
    const digitos = cep.replace(/\D/g, '');

    return defer(() => {
      const prefixo = digitos.slice(0, 5);
      const encontrado = CEPS_MOCK.get(prefixo);

      return of<EnderecoPorCep>({
        cep: digitos,
        ...(encontrado ?? CEP_PADRAO),
        encontrado: Boolean(encontrado),
      });
    }).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /**
   * Fluxo crítico de compra.
   *
   * A reserva do estoque acontece de forma **síncrona no momento da inscrição**,
   * antes da latência de pagamento. É isso que garante a regra anti-duplicação:
   * dois checkouts disparados ao mesmo tempo na virada do lote são serializados,
   * o segundo enxerga o estoque já debitado e é recusado em vez de estourar o
   * limite. Se o pagamento falhar depois, a reserva é devolvida ao estoque.
   */
  processarCheckout(requisicao: CheckoutRequest): Observable<CheckoutResponse> {
    return defer(() => of(this.reservar(requisicao))).pipe(
      comLatencia(LATENCIA_CRITICA, this.fator),
      map((reserva) => this.concluir(reserva, requisicao)),
    );
  }

  // --- Painel do produtor --------------------------------------------------

  /** Números consolidados do evento para o dashboard. */
  obterResumoVendas(): Observable<ResumoVendas> {
    return defer(() => {
      const ativo = this.lotes.find((lote) => lote.status === 'ativo') ?? null;
      const ingressosVendidos = this.lotes.reduce((soma, l) => soma + l.quantidadeVendida, 0);
      const capacidade = this.lotes.reduce((soma, l) => soma + l.quantidadeTotal, 0);
      const receitaBrutaCentavos = this.lotes.reduce(
        (soma, l) => soma + l.quantidadeVendida * (l.precoCentavos + l.taxaCentavos),
        0,
      );

      return of<ResumoVendas>({
        ingressosVendidos,
        ingressosDisponiveis: capacidade - ingressosVendidos,
        receitaBrutaCentavos,
        ticketMedioCentavos: ingressosVendidos
          ? Math.round(receitaBrutaCentavos / ingressosVendidos)
          : 0,
        loteAtivoNome: ativo?.nome ?? null,
        loteAtivoDisponivel: ativo ? ativo.quantidadeTotal - ativo.quantidadeVendida : 0,
        atualizadoEm: new Date().toISOString(),
      });
    }).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /** Desempenho lote a lote — mostra onde a receita foi feita. */
  obterDesempenhoLotes(): Observable<readonly DesempenhoLote[]> {
    return defer(() =>
      of(
        this.lotes
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map<DesempenhoLote>((lote) => ({
            loteId: lote.id,
            nome: lote.nome,
            vendidos: lote.quantidadeVendida,
            total: lote.quantidadeTotal,
            receitaCentavos: lote.quantidadeVendida * (lote.precoCentavos + lote.taxaCentavos),
            status: lote.status,
          })),
      ),
    ).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /**
   * Inteligência geográfica: cruza o CEP/bairro informado no checkout para
   * mostrar de onde vem o público — é o que baratear a mídia da próxima edição.
   */
  obterRegioes(): Observable<readonly RegiaoCompradores[]> {
    return defer(() => {
      const totalIngressos = this.compradores.reduce((soma, c) => soma + c.ingressosComprados, 0);
      const porRegiao = new Map<string, RegiaoCompradores>();

      for (const comprador of this.compradores) {
        const chave = `${comprador.bairro}|${comprador.cidade}|${comprador.uf}`;
        const atual = porRegiao.get(chave);

        porRegiao.set(chave, {
          bairro: comprador.bairro,
          cidade: comprador.cidade,
          uf: comprador.uf,
          compradores: (atual?.compradores ?? 0) + 1,
          ingressos: (atual?.ingressos ?? 0) + comprador.ingressosComprados,
          receitaCentavos: (atual?.receitaCentavos ?? 0) + comprador.totalGastoCentavos,
          participacao: 0,
        });
      }

      const regioes = [...porRegiao.values()]
        .map((regiao) => ({
          ...regiao,
          participacao: totalIngressos
            ? Math.round((regiao.ingressos / totalIngressos) * 1000) / 10
            : 0,
        }))
        .sort((a, b) => b.ingressos - a.ingressos);

      return of<readonly RegiaoCompradores[]>(regioes);
    }).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /**
   * Base de compradores para fidelização e remarketing.
   * Busca e paginação acontecem "no servidor" (aqui, no mock) — a UI nunca
   * recebe a base inteira, do mesmo jeito que será com o Supabase.
   */
  obterCompradores(consulta: ConsultaCompradores): Observable<PaginaCompradores> {
    return defer(() => {
      const termo = consulta.busca.trim().toLowerCase();
      const filtrados = termo
        ? this.compradores.filter((c) =>
            [c.nome, c.email, c.whatsapp, c.bairro, c.cidade].some((campo) =>
              campo.toLowerCase().includes(termo),
            ),
          )
        : this.compradores.slice();

      const ordenados = filtrados.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
      const tamanho = Math.max(1, consulta.tamanhoPagina);
      const totalPaginas = Math.max(1, Math.ceil(ordenados.length / tamanho));
      const pagina = Math.min(Math.max(1, consulta.pagina), totalPaginas);
      const inicio = (pagina - 1) * tamanho;

      return of<PaginaCompradores>({
        itens: ordenados.slice(inicio, inicio + tamanho),
        total: ordenados.length,
        pagina,
        totalPaginas,
      });
    }).pipe(comLatencia(LATENCIA_BUSCA, this.fator));
  }

  /** Snapshot ordenado dos lotes, já enriquecido com os dados de urgência da UI. */
  protected instantaneoDosLotes(): readonly LoteVitrine[] {
    return this.lotes
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((lote) => paraLoteVitrine(lote));
  }

  protected get baseDeCompradores(): readonly CompradorRegistro[] {
    return this.compradores;
  }

  // --- Estoque -------------------------------------------------------------

  /** Debita o estoque imediatamente. Único ponto autorizado a vender ingresso. */
  private reservar(requisicao: CheckoutRequest): Reserva {
    const { loteId, quantidade } = requisicao;
    const lote = this.lotes.find((item) => item.id === loteId);

    if (!lote) {
      return { ok: false, quantidade, motivo: 'erro_inesperado', mensagem: 'Lote não encontrado.' };
    }

    if (quantidade < 1 || quantidade > LIMITE_POR_PEDIDO) {
      return {
        ok: false,
        quantidade,
        motivo: 'erro_inesperado',
        mensagem: `Escolha entre 1 e ${LIMITE_POR_PEDIDO} ingressos por pedido.`,
      };
    }

    if (lote.status !== 'ativo') {
      return {
        ok: false,
        lote,
        quantidade,
        motivo: 'lote_encerrado',
        mensagem: 'Este lote foi encerrado enquanto você preenchia o checkout.',
      };
    }

    const disponivel = lote.quantidadeTotal - lote.quantidadeVendida;
    if (disponivel < quantidade) {
      return {
        ok: false,
        lote,
        quantidade,
        motivo: 'estoque_insuficiente',
        mensagem:
          disponivel === 0
            ? 'Os ingressos deste lote acabaram de esgotar.'
            : `Restam apenas ${disponivel} ingresso(s) neste lote.`,
      };
    }

    this.aplicarVenda(lote.id, quantidade);
    return { ok: true, lote: this.encontrar(lote.id), quantidade };
  }

  /** Devolve ao estoque uma reserva cujo pagamento não foi aprovado. */
  private liberar(loteId: string, quantidade: number): void {
    this.atualizar(loteId, (lote) => ({
      ...lote,
      quantidadeVendida: Math.max(0, lote.quantidadeVendida - quantidade),
      // O lote sai de "esgotado" porque voltou a ter estoque, mas quem decide se
      // ele volta a vender é a virada — o lote seguinte pode já ter assumido.
      status: lote.status === 'esgotado' ? 'aguardando' : lote.status,
    }));
    this.reavaliarViradaDeLote();
  }

  private aplicarVenda(loteId: string, quantidade: number): void {
    this.atualizar(loteId, (lote) => ({
      ...lote,
      quantidadeVendida: lote.quantidadeVendida + quantidade,
    }));
    this.reavaliarViradaDeLote();
  }

  /**
   * Virada automática: assim que um lote atinge o limite ele é bloqueado e o
   * próximo da fila entra em venda — sem intervenção manual do produtor.
   */
  private reavaliarViradaDeLote(): void {
    const emOrdem = this.lotes.slice().sort((a, b) => a.ordem - b.ordem);

    for (const lote of emOrdem) {
      if (lote.quantidadeVendida >= lote.quantidadeTotal && lote.status !== 'esgotado') {
        this.atualizar(lote.id, (atual) => ({ ...atual, status: 'esgotado' }));
      }
    }

    const temAtivo = this.lotes.some((lote) => lote.status === 'ativo');
    if (temAtivo) {
      return;
    }

    const proximo = this.lotes
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .find((lote) => lote.status === 'aguardando' && lote.quantidadeVendida < lote.quantidadeTotal);

    if (proximo) {
      this.atualizar(proximo.id, (atual) => ({ ...atual, status: 'ativo' }));
    }
  }

  private atualizar(loteId: string, alteracao: (lote: Lote) => Lote): void {
    this.lotes = this.lotes.map((lote) => (lote.id === loteId ? alteracao(lote) : lote));
  }

  private encontrar(loteId: string): Lote {
    const lote = this.lotes.find((item) => item.id === loteId);
    if (!lote) {
      throw new Error(`Lote inexistente: ${loteId}`);
    }
    return lote;
  }

  // --- Pagamento -----------------------------------------------------------

  private concluir(reserva: Reserva, requisicao: CheckoutRequest): CheckoutResponse {
    if (!reserva.ok || !reserva.lote) {
      return this.respostaDeFalha(
        reserva.motivo ?? 'erro_inesperado',
        reserva.mensagem ?? 'Não foi possível concluir a compra.',
        reserva.lote?.nome ?? '',
        reserva.quantidade,
      );
    }

    const lote = reserva.lote;
    const total = (lote.precoCentavos + lote.taxaCentavos) * reserva.quantidade;

    if (!this.pagamentoAprovado(requisicao)) {
      // Pagamento recusado devolve o estoque — ingresso nenhum fica preso.
      this.liberar(lote.id, reserva.quantidade);

      return this.respostaDeFalha(
        'pagamento_recusado',
        'Pagamento recusado pela operadora. Confira os dados do cartão ou tente via PIX.',
        lote.nome,
        reserva.quantidade,
        total,
      );
    }

    const pedidoId = this.proximoPedidoId();
    const ingressos = this.emitirIngressos(pedidoId, lote, requisicao);
    this.registrarComprador(requisicao, reserva.quantidade, total);

    return {
      sucesso: true,
      status: 'aprovado',
      pedidoId,
      loteNome: lote.nome,
      quantidade: reserva.quantidade,
      totalCentavos: total,
      ingressos,
      pixCopiaECola:
        requisicao.metodo === 'pix' ? this.gerarPixCopiaECola(pedidoId, total) : undefined,
      emailEnviadoPara: requisicao.comprador.email,
      mensagem: 'Pagamento aprovado! Seu ingresso digital já foi enviado por e-mail.',
    };
  }

  /**
   * Regra determinística do mock: PIX sempre aprova; cartão é recusado quando o
   * número termina em `0000`. Isso dá um caminho previsível para testar a UI de erro.
   */
  private pagamentoAprovado(requisicao: CheckoutRequest): boolean {
    if (requisicao.metodo === 'pix') {
      return true;
    }

    const digitos = (requisicao.cartao?.numero ?? '').replace(/\D/g, '');
    return digitos.length >= 13 && !digitos.endsWith('0000');
  }

  private emitirIngressos(
    pedidoId: string,
    lote: Lote,
    requisicao: CheckoutRequest,
  ): readonly Ingresso[] {
    const emitidoEm = new Date().toISOString();

    return Array.from({ length: requisicao.quantidade }, (_, indice) => {
      const codigo = this.gerarCodigo(indice);

      return {
        id: `${pedidoId}-${indice + 1}`,
        codigo,
        qrCodePayload: `SUNSETVIBEZZ|${EVENTO_MOCK.id}|${pedidoId}|${codigo}`,
        eventoNome: EVENTO_MOCK.nome,
        loteNome: lote.nome,
        nomeComprador: requisicao.comprador.nome,
        precoPagoCentavos: lote.precoCentavos + lote.taxaCentavos,
        emitidoEm,
      } satisfies Ingresso;
    });
  }

  /** Consolida o comprador na base do produtor (dado estratégico do MVP). */
  private registrarComprador(
    requisicao: CheckoutRequest,
    quantidade: number,
    totalCentavos: number,
  ): void {
    const { comprador } = requisicao;
    const existente = this.compradores.find(
      (registro) => registro.email.toLowerCase() === comprador.email.toLowerCase(),
    );

    if (existente) {
      this.compradores = this.compradores.map((registro) =>
        registro.id === existente.id
          ? {
              ...registro,
              ...comprador,
              ingressosComprados: registro.ingressosComprados + quantidade,
              totalGastoCentavos: registro.totalGastoCentavos + totalCentavos,
            }
          : registro,
      );
      return;
    }

    this.compradores = [
      ...this.compradores,
      {
        ...comprador,
        id: `cmp-${String(this.compradores.length + 1).padStart(4, '0')}`,
        criadoEm: new Date().toISOString(),
        ingressosComprados: quantidade,
        totalGastoCentavos: totalCentavos,
      },
    ];
  }

  private respostaDeFalha(
    motivo: MotivoFalha,
    mensagem: string,
    loteNome: string,
    quantidade: number,
    totalCentavos = 0,
  ): CheckoutResponse {
    return {
      sucesso: false,
      status: 'recusado',
      pedidoId: '',
      loteNome,
      quantidade,
      totalCentavos,
      ingressos: [],
      motivoFalha: motivo,
      mensagem,
    };
  }

  private proximoPedidoId(): string {
    this.sequencialPedido += 1;
    return `SV${new Date().getFullYear()}-${String(this.sequencialPedido).padStart(5, '0')}`;
  }

  private gerarCodigo(indice: number): string {
    const bloco = () => Math.random().toString(36).toUpperCase().slice(2, 6);
    return `SV-${bloco()}-${bloco().slice(0, 3)}${indice + 1}`;
  }

  private gerarPixCopiaECola(pedidoId: string, totalCentavos: number): string {
    const valor = (totalCentavos / 100).toFixed(2);
    return `00020126580014BR.GOV.BCB.PIX0136sunsetvibezz@pagamentos.com.br52040000` +
      `5303986540${valor.length}${valor}5802BR5913SUNSET VIBEZZ6009SAO PAULO62${pedidoId.length + 4}05${pedidoId}6304`;
  }
}

/** Traduz o registro cru do "banco" para o que a vitrine precisa exibir. */
export function paraLoteVitrine(lote: Lote): LoteVitrine {
  const disponivel = Math.max(0, lote.quantidadeTotal - lote.quantidadeVendida);

  return {
    ...lote,
    disponivel,
    totalCentavos: lote.precoCentavos + lote.taxaCentavos,
    acabando: lote.status === 'ativo' && disponivel > 0 && disponivel <= GATILHO_ESCASSEZ,
    percentualVendido: Math.round((lote.quantidadeVendida / lote.quantidadeTotal) * 100),
  };
}
