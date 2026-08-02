import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EVENTO_MOCK, GATILHO_ESCASSEZ, LOTES_MOCK } from '../mocks/dados-mock';
import { Evento, Lote, LoteVitrine } from '../models';

/**
 * Backend temporário da aplicação.
 * Mantém o estoque em memória e responde com os mesmos contratos previstos para
 * o Supabase/Cloud Functions — a troca futura não deve tocar em componente algum.
 */
@Injectable({ providedIn: 'root' })
export class TicketMockService {
  /** Cópia mutável: as vendas do mock alteram este estado durante a sessão. */
  private lotes: Lote[] = LOTES_MOCK.map((lote) => ({ ...lote }));

  obterEvento(): Observable<Evento> {
    return of(EVENTO_MOCK);
  }

  obterLotes(): Observable<readonly LoteVitrine[]> {
    return of(this.instantaneoDosLotes());
  }

  /** Lote que está vendendo agora — `null` quando tudo esgotou. */
  obterLoteAtivo(): Observable<LoteVitrine | null> {
    return of(this.instantaneoDosLotes().find((lote) => lote.status === 'ativo') ?? null);
  }

  /** Snapshot ordenado dos lotes, já enriquecido com os dados de urgência da UI. */
  protected instantaneoDosLotes(): readonly LoteVitrine[] {
    return this.lotes
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((lote) => paraLoteVitrine(lote));
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
