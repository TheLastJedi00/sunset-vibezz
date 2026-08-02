# Camadas de UI — Design Atômico

Todos os componentes são **TS-only**: `template` e `styles` ficam inline no decorator.
Não criar arquivos `.html` ou `.scss` por componente.

| Camada       | Pasta         | Responsabilidade                                                                 |
| ------------ | ------------- | -------------------------------------------------------------------------------- |
| Átomos       | `atoms/`      | Blocos indivisíveis, sem regra de negócio (Button, Badge, Skeleton, Input).        |
| Moléculas    | `molecules/`  | Composição curta de átomos com um propósito único (LoteCard, StatTile).            |
| Organismos   | `organisms/`  | Blocos completos de interface com estado próprio (Hero, Header, CheckoutModal).    |
| Templates    | `templates/`  | Esqueleto de layout sem dados — recebe conteúdo por projeção/rotas.                |
| Páginas      | `../pages/`   | Rota + orquestração de serviços e estado (vitrine, checkout, admin).               |

Convenções:

- Um componente por arquivo, `changeDetection: OnPush`, `imports` explícitos (standalone).
- Prefixo de seletor `app-` (definido em `angular.json`).
- Entradas com `input()` / `input.required()` e saídas com `output()` — nada de decorators legados.
- Estado sempre com Signals; nada de `zone.js` (a aplicação é zoneless).
- Mobile-first e `flex-col` como padrão de estruturação.
