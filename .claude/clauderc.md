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

## 📝 Planejamento de Sprints (Task Breakdown)

Quando solicitado para planejar uma nova funcionalidade com base em uma especificação (spec), você deve atuar como um Tech Lead e quebrar o escopo em tarefas granulares e sequenciais, atualizando o `tasks.md` antes de escrever qualquer linha de código.

Siga este padrão ao gerar as tarefas:
1. **Leitura de Contexto:** Leia o arquivo `.md` correspondente na pasta `.claude/specs/`.
2. **Granularidade:** Divida a funcionalidade em passos lógicos e pequenos (ex: Setup de rotas, Criação de UI com Tailwind, Lógica de Sinais/Serviços, Testes).
3. **Escrita no tasks.md:** Adicione uma nova seção no `tasks.md` com o nome da Sprint e liste as tarefas geradas usando o formato `- [ ] descrição da tarefa`.
4. **Validação:** Após atualizar o `tasks.md`, apresente a lista de tarefas gerada no terminal e aguarde a aprovação do usuário antes de iniciar a codificação e a criação da branch (conforme o fluxo de Git estabelecido).

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
## 📋 Gerenciamento de Tarefas e Fluxo Git (tasks.md)

Como agente autônomo deste projeto, você atua tanto como Engenheiro de Software quanto como Tech Lead. O arquivo `tasks.md` localizado na raiz do projeto é a sua memória primária e fonte da verdade para o progresso do desenvolvimento. 

Você deve seguir estritamente o fluxo de trabalho abaixo sem que o usuário precise lembrar você a cada interação:

1. **Consulta Autônoma:** Sempre que for solicitado para continuar o desenvolvimento ou iniciar o dia, leia o `tasks.md` para identificar a próxima tarefa pendente `[ ]`.
2. **Branches por Sprint:** Cada "Sprint" definida no `tasks.md` representa uma nova branch no Git.
   - Antes de iniciar a primeira tarefa de uma nova Sprint, você deve criar e mudar para uma nova branch usando o prefixo `feat/` (ex: `feat/sprint-1-autenticacao`).
3. **Commits por Tarefa:** Cada tarefa individual listada no `tasks.md` equivale a exatamente 1 (um) commit.
   - Ao finalizar a codificação de uma tarefa específica e garantir que ela funciona, você deve adicionar os arquivos ao stage (`git add`) e criar um commit semântico descrevendo exatamente a tarefa realizada (ex: `feat: integra servico de login com signals`).
4. **Atualização de Status Automática:** 
   - Imediatamente após realizar o commit de uma tarefa, abra o arquivo `tasks.md` e marque a tarefa concluída alterando de `[ ]` para `[x]`.
   - Após atualizar o arquivo, informe o usuário no terminal que o commit foi feito e a tarefa foi marcada.
5. **Fechamento de Sprint e Pull Request (PR):**
   - Quando a última tarefa de uma Sprint for marcada como concluída `[x]` no `tasks.md`, você deve finalizar o ciclo.
   - Faça o push da branch atual (`feat/...`) para o repositório remoto.
   - Abra automaticamente um Pull Request (PR) contra a branch remota `dev`.
   - Informe o usuário que a Sprint foi concluída, o PR foi aberto e aguarde a aprovação antes de iniciar a próxima Sprint.