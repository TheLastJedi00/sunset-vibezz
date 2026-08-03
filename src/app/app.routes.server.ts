import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // A vitrine é a porta de entrada da campanha: sai prerenderizada para abrir instantânea.
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  // Checkout e painel dependem de estado do comprador/produtor — renderizam no cliente.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
