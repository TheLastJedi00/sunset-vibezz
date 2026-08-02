import { CompradorRegistro, Evento, Lote } from '../models';

/**
 * Fonte de verdade temporária da aplicação.
 * Tudo aqui espelha o formato previsto para as tabelas do Supabase — quando o
 * backend real entrar, só o serviço muda; os componentes continuam iguais.
 */

export const EVENTO_MOCK: Evento = {
  id: 'evt-sunset-vibezz-2026-09',
  nome: 'Sunset Vibezz',
  subtitulo: 'Ibiza Flashback Experience',
  descricao:
    'Uma noite inteira em modo Ibiza: house melódico do pôr do sol à madrugada, ' +
    'estrutura open air à beira-mar e line-up com os DJs que fizeram a era de ouro da ilha.',
  dataInicio: '2026-09-12T17:00:00-03:00',
  dataFim: '2026-09-13T04:00:00-03:00',
  local: {
    nome: 'Vibezz Rooftop & Beach Club',
    endereco: 'Av. Atlântica, 2100',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
  atracoes: [
    { nome: 'ANNA MARIE', horario: '17:00', destaque: false },
    { nome: 'DJ CAIO LUZ', horario: '19:00', destaque: false },
    { nome: 'BALEARIC SOUND SYSTEM', horario: '21:30', destaque: true },
    { nome: 'MARCO DELLA (IBZ)', horario: '00:00', destaque: true },
    { nome: 'SUNRISE B2B SET', horario: '02:30', destaque: false },
  ],
  classificacaoEtaria: '18 anos',
};

/**
 * Estado inicial dos lotes. `quantidadeVendida` já vem populado para simular
 * uma campanha em andamento: o promocional esgotou e o Lote 1 está na reta final.
 */
export const LOTES_MOCK: readonly Lote[] = [
  {
    id: 'lote-promocional',
    eventoId: EVENTO_MOCK.id,
    nome: 'Promocional',
    ordem: 1,
    precoCentavos: 4990,
    taxaCentavos: 0,
    quantidadeTotal: 60,
    quantidadeVendida: 60,
    status: 'esgotado',
  },
  {
    id: 'lote-1',
    eventoId: EVENTO_MOCK.id,
    nome: 'Lote 1',
    ordem: 2,
    precoCentavos: 6990,
    taxaCentavos: 0,
    quantidadeTotal: 150,
    quantidadeVendida: 132,
    status: 'ativo',
  },
  {
    id: 'lote-2',
    eventoId: EVENTO_MOCK.id,
    nome: 'Lote 2',
    ordem: 3,
    precoCentavos: 8990,
    taxaCentavos: 0,
    quantidadeTotal: 200,
    quantidadeVendida: 0,
    status: 'aguardando',
  },
  {
    id: 'lote-portaria',
    eventoId: EVENTO_MOCK.id,
    nome: 'Portaria',
    ordem: 4,
    precoCentavos: 12000,
    taxaCentavos: 0,
    quantidadeTotal: 100,
    quantidadeVendida: 0,
    status: 'aguardando',
  },
];

/** Estoque restante a partir do qual a vitrine grita escassez. */
export const GATILHO_ESCASSEZ = 25;

/** Máximo de ingressos por pedido — trava simples contra cambista. */
export const LIMITE_POR_PEDIDO = 6;

interface DistribuicaoRegiao {
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
  readonly cepPrefixo: string;
  readonly compradores: number;
  readonly ingressos: number;
}

/**
 * Distribuição geográfica usada para semear a base de compradores.
 * Os totais batem exatamente com os 192 ingressos já vendidos em `LOTES_MOCK`.
 */
const DISTRIBUICAO_REGIOES: readonly DistribuicaoRegiao[] = [
  { bairro: 'Copacabana', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22020', compradores: 14, ingressos: 32 },
  { bairro: 'Barra da Tijuca', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22640', compradores: 12, ingressos: 24 },
  { bairro: 'Ipanema', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22410', compradores: 10, ingressos: 19 },
  { bairro: 'Tijuca', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '20510', compradores: 9, ingressos: 16 },
  { bairro: 'Botafogo', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22250', compradores: 8, ingressos: 15 },
  { bairro: 'Icaraí', cidade: 'Niterói', uf: 'RJ', cepPrefixo: '24220', compradores: 7, ingressos: 13 },
  { bairro: 'Recreio dos Bandeirantes', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22795', compradores: 6, ingressos: 11 },
  { bairro: 'Jacarepaguá', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22710', compradores: 6, ingressos: 10 },
  { bairro: 'Centro', cidade: 'São Gonçalo', uf: 'RJ', cepPrefixo: '24440', compradores: 5, ingressos: 9 },
  { bairro: 'Méier', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '20720', compradores: 5, ingressos: 8 },
  { bairro: 'Centro', cidade: 'Duque de Caxias', uf: 'RJ', cepPrefixo: '25010', compradores: 4, ingressos: 7 },
  { bairro: 'Flamengo', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22220', compradores: 4, ingressos: 6 },
  { bairro: 'Campo Grande', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '23050', compradores: 4, ingressos: 6 },
  { bairro: 'Leblon', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '22440', compradores: 3, ingressos: 6 },
  { bairro: 'Santa Teresa', cidade: 'Rio de Janeiro', uf: 'RJ', cepPrefixo: '20240', compradores: 3, ingressos: 5 },
  { bairro: 'Centro', cidade: 'Petrópolis', uf: 'RJ', cepPrefixo: '25610', compradores: 3, ingressos: 5 },
];

const NOMES = [
  'Ana Beatriz Moraes', 'Rafael Nunes', 'Carolina Prado', 'Diego Almeida',
  'Juliana Rocha', 'Thiago Vasconcelos', 'Marina Castro', 'Lucas Ferraz',
  'Isabela Menezes', 'Pedro Henrique Lima', 'Camila Duarte', 'Vitor Andrade',
  'Larissa Peixoto', 'Bruno Sampaio', 'Fernanda Braga', 'Gustavo Teixeira',
  'Renata Cardoso', 'Felipe Barbosa', 'Aline Figueiredo', 'Matheus Ribeiro',
  'Patrícia Salles', 'Rodrigo Cunha', 'Natália Vieira', 'Eduardo Pacheco',
];

/** "Patrícia Salles" -> "patricia" (para montar e-mails plausíveis). */
const primeiroNome = (nome: string) =>
  nome
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * Semeia a base de compradores de forma determinística a partir da
 * distribuição acima, respeitando a ordem de virada dos lotes: os primeiros
 * 60 ingressos saíram no Promocional, os seguintes no Lote 1.
 */
function semearCompradores(): CompradorRegistro[] {
  const registros: CompradorRegistro[] = [];
  const precoDoIngresso = (indiceGlobal: number) =>
    indiceGlobal < LOTES_MOCK[0].quantidadeTotal
      ? LOTES_MOCK[0].precoCentavos
      : LOTES_MOCK[1].precoCentavos;

  let ingressoGlobal = 0;
  let indiceNome = 0;
  let sequencial = 0;

  for (const regiao of DISTRIBUICAO_REGIOES) {
    const base = Math.floor(regiao.ingressos / regiao.compradores);
    const sobra = regiao.ingressos % regiao.compradores;

    for (let i = 0; i < regiao.compradores; i++) {
      const quantidade = base + (i < sobra ? 1 : 0);
      let total = 0;
      for (let t = 0; t < quantidade; t++) {
        total += precoDoIngresso(ingressoGlobal++);
      }

      const nome = NOMES[indiceNome % NOMES.length];
      indiceNome++;
      sequencial++;

      // Datas espaçadas para trás, simulando a curva de vendas das últimas semanas.
      const criadoEm = new Date(Date.UTC(2026, 6, 1, 12, 0, 0) + sequencial * 6 * 3600 * 1000);

      registros.push({
        id: `cmp-${String(sequencial).padStart(4, '0')}`,
        nome,
        email: `${primeiroNome(nome)}.${sequencial}@email.com`,
        whatsapp: `219${String(80000000 + sequencial * 137).slice(0, 8)}`,
        cep: `${regiao.cepPrefixo}${String(100 + (sequencial % 900)).slice(0, 3)}`,
        bairro: regiao.bairro,
        cidade: regiao.cidade,
        uf: regiao.uf,
        criadoEm: criadoEm.toISOString(),
        ingressosComprados: quantidade,
        totalGastoCentavos: total,
      });
    }
  }

  return registros;
}

export const COMPRADORES_MOCK: readonly CompradorRegistro[] = semearCompradores();
