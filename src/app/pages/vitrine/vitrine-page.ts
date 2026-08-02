import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vitrine-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex flex-col grow px-5 py-10">
      <h1 class="text-3xl font-black">Sunset Vibezz</h1>
    </main>
  `,
})
export class VitrinePage {}
