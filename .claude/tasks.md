# Tarefas do Projeto - Sunset Vibezz (Ibiza Flashback Experience)

Spec de referência: `.claude/specs/001 - MVC.md`

## Sprint 1: Fundação e Design System
- [x] Instalar e configurar Tailwind CSS no build do Angular (`styles.scss` + PostCSS)
- [x] Definir fundações visuais no `styles.scss`: paleta no `:root` (`#00000A`, `#310D33`, `#F87E3A`), tipografia e background global
- [x] Criar utilitários de animação `animate-enter` / `animate-leave` (fade + slide) como camada global reutilizável
- [x] Estruturar pastas do Design Atômico (`atoms`, `molecules`, `organisms`, `templates`, `pages`) com componentes inline TS-only
- [x] Criar átomos base: `Button` (com estado `loading`/`disabled`), `Badge` e `Skeleton` pulsante
- [x] Configurar rotas iniciais (`/` vitrine, `/checkout`, `/admin`) com lazy loading

## Sprint 2: Camada de Dados Mockada
- [x] Criar contratos tipados (`Evento`, `Lote`, `Comprador`, `CheckoutRequest`, `CheckoutResponse`, `Ingresso`)
- [x] Implementar `TicketMockService` com dados fixos do evento e dos lotes
- [x] Adicionar latência artificial nos mocks (800–1200ms em buscas, 2000–3000ms em checkout) via `delay` do RxJS
- [x] Implementar no mock a regra de virada automática de lote e o bloqueio anti-duplicação de estoque
- [x] Criar store de estado com Signals (lote ativo, estoque restante, `isLoading`, `isProcessingPayment`)

## Sprint 3: Vitrine do Evento
- [x] Montar organismo `Hero` com identidade visual, data, local e atrações (mobile-first, `flex-col`)
- [x] Criar molécula `LoteCard` exibindo lote ativo, preço e estado esgotado/bloqueado
- [x] Implementar alerta de escassez ("Últimos ingressos deste lote") baseado no estoque restante
- [ ] Aplicar Skeleton Screens no carregamento inicial da vitrine (evento + cards de lote)
- [ ] Implementar loading fullscreen glassmorphism no `onInit` da página conforme diretriz do clauderc
- [ ] Validar responsividade e hierarquia visual da vitrine no mobile

## Sprint 4: Checkout e Pagamento
- [ ] Criar template de checkout em etapas curtas com navegação entre steps
- [ ] Implementar formulário reativo de dados do comprador (Nome, E-mail, WhatsApp, CEP/Bairro) com validações
- [ ] Criar seleção de método de pagamento (PIX e Cartão de Crédito) com mock de processamento
- [ ] Implementar modal de processamento com `backdrop-blur`, `animate-enter` e spinner
- [ ] Aplicar bloqueio de interação anti-duplicidade nos botões (`opacity-50 cursor-not-allowed pointer-events-none` + "Processando...")
- [ ] Criar tela de confirmação com ingresso digital e QR Code mockado
- [ ] Tratar cenários de erro/recusa de pagamento com feedback visual

## Sprint 5: Painel Administrativo
- [ ] Criar layout base do painel admin com aside animado (`animate-enter`/`animate-leave`)
- [ ] Implementar dashboard de vendas (total de ingressos, receita bruta, lote ativo) com skeletons
- [ ] Criar relatório de inteligência geográfica agregando CEP/Bairro dos compradores
- [ ] Criar listagem da base de clientes (nome, e-mail, WhatsApp) com busca e paginação mockada
- [ ] Validar responsividade do painel no mobile
