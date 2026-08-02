# Especificações de Frontend

## 1. Arquitetura e Estrutura
- **Design Atômico:** Componentização estruturada seguindo a metodologia de Átomos, Moléculas, Organismos, Templates e Páginas.
- **Arquivos Únicos (TS Only):** Os componentes devem existir exclusivamente em arquivos `.ts`. Utilizar o _decorator_ nativo para manter `template` e `styles` de forma _inline_, abolindo a criação de arquivos `.html` ou `.scss` adicionais por componente.

## 2. Estilo e Design System
- **Tailwind CSS:** Maximizar o uso das classes utilitárias do framework para espaçamentos, tipografia, grid e comportamento responsivo.
- **Identidade Visual e `styles.scss`:** Manter um arquivo global `styles.scss` voltado para as fundações da identidade visual, injeção da paleta de cores no `:root` e regras globais inabdicáveis que não couberem no utility-first.
- **Estética de Design (Glassmorphism):** Design moderno focado na profundidade. Utilizar desfoques leves (`backdrop-blur`) e backgrounds translúcidos (`bg-opacity-*`) em elementos flutuantes e painéis.

## 3. Paleta de Cores
- **Background Global:** `#00000A`
- **Cor Primária:** `#310D33`
- **Accent (Destaque/CTAs):** `#F87E3A`

## 4. Layout e Comportamento
- **Mobile-First:** Todo o desenvolvimento de interface deve partir da versão móvel, escalando gradualmente para resoluções maiores.
- **Estruturação Direcional:** Evitar a aglutinação horizontal de elementos (`flex-row`). Priorizar agressivamente a disposição em colunas (`flex-col`), garantindo fluidez e leiturabilidade otimizada na abordagem mobile-first.

## 5. Animações e Transições
- **Classes de Ciclo de Vida:** Implementar e padronizar as diretrizes de animação `animate-enter` (fade in / slide in) e `animate-leave` (fade out / slide out).
- **Escopo de Animação:** Aplicação estrita dessas animações nos seguintes elementos interativos:
  - Modais (Pop-ups e checkouts)
  - Asides (Sidebars, drawhers e painéis laterais)
  - Header (Comportamento de visibilidade e interações)
  - Loadings (Loading fullscreen na tela sempre que a page fizer uma requisição onInit)

# Título do Projeto: Sunset Vibess
## Sub-título: Ibiza Flashback Experience

# Estrutura de tasks.md
```
# Tarefas do Projeto - SaaS

## Sprint 1: Setup e Autenticação
- [x] Criar projeto Angular com Tailwind (Feito em 01/08)
- [x] Configurar roteamento inicial
- [ ] Criar tela de Login baseada na spec `.claude/specs/01-autenticacao.md`
- [ ] Integrar serviço de autenticação com Signals
- [ ] Validar responsividade no mobile

## Sprint 2: Dashboard
- [ ] Criar layout base do painel
```