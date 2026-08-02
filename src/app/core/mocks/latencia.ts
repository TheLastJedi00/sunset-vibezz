import { InjectionToken } from '@angular/core';
import { MonoTypeOperatorFunction, delay } from 'rxjs';

/**
 * Multiplicador global da latência simulada.
 * Vale 1 na aplicação; testes injetam 0 para rodar sem espera.
 */
export const FATOR_LATENCIA = new InjectionToken<number>('FATOR_LATENCIA', {
  providedIn: 'root',
  factory: () => 1,
});

export interface FaixaLatencia {
  readonly min: number;
  readonly max: number;
}

/** Buscas simples: vitrine do evento, status de lotes, listagens do painel. */
export const LATENCIA_BUSCA: FaixaLatencia = { min: 800, max: 1200 };

/** Processamentos críticos: checkout e validação de pagamento. */
export const LATENCIA_CRITICA: FaixaLatencia = { min: 2000, max: 3000 };

/** Sorteia um tempo dentro da faixa para o loading não parecer artificialmente fixo. */
export function sortearLatencia({ min, max }: FaixaLatencia): number {
  return Math.round(min + Math.random() * (max - min));
}

/**
 * Atraso intencional aplicado aos mocks. Existe para que os estados de
 * carregamento sejam projetados com tempos realistas antes do backend entrar.
 */
export function comLatencia<T>(
  faixa: FaixaLatencia = LATENCIA_BUSCA,
  fator = 1,
): MonoTypeOperatorFunction<T> {
  return (origem) => origem.pipe(delay(Math.round(sortearLatencia(faixa) * fator)));
}
