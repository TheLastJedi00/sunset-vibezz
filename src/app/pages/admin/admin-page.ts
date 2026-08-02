import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex flex-col grow px-5 py-10">
      <h1 class="text-2xl font-black">Painel do Produtor</h1>
    </main>
  `,
})
export class AdminPage {}
