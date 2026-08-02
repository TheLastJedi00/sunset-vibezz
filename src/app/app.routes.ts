import { Routes } from '@angular/router';

const EVENTO = 'Sunset Vibezz — Ibiza Flashback Experience';

export const routes: Routes = [
  {
    path: '',
    title: EVENTO,
    loadComponent: () => import('./pages/vitrine/vitrine-page').then((m) => m.VitrinePage),
  },
  {
    path: 'checkout',
    title: `Checkout | ${EVENTO}`,
    loadComponent: () => import('./pages/checkout/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'admin',
    title: `Painel do Produtor | ${EVENTO}`,
    loadComponent: () => import('./pages/admin/admin-page').then((m) => m.AdminPage),
  },
  {
    path: '**',
    title: `Página não encontrada | ${EVENTO}`,
    loadComponent: () =>
      import('./pages/nao-encontrada/nao-encontrada-page').then((m) => m.NaoEncontradaPage),
  },
];
