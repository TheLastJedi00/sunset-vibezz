import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex flex-col grow px-5 py-10">
      <h1 class="text-2xl font-black">Checkout</h1>
    </main>
  `,
})
export class CheckoutPage {}
