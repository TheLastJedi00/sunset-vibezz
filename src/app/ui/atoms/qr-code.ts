import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { toString as qrParaSvg } from 'qrcode';

/**
 * QR Code de validação do ingresso.
 *
 * Gera um SVG real (lido por qualquer leitor na portaria) a partir do payload.
 * Usa a biblioteca `qrcode` em vez de um desenho decorativo: um QR que não
 * escaneia seria inútil no dia do evento.
 */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="overflow-hidden rounded-2xl bg-ink p-3"
      [innerHTML]="svg()"
      role="img"
      [attr.aria-label]="descricao()"
    ></div>
  `,
})
export class QrCode {
  private readonly sanitizer = inject(DomSanitizer);

  readonly payload = input.required<string>();
  readonly descricao = input('QR Code de validação do ingresso');

  protected readonly svg = signal<SafeHtml | null>(null);

  constructor() {
    effect(() => {
      const payload = this.payload();

      qrParaSvg(payload, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 0,
        color: { dark: '#00000A', light: '#F5F1EF' },
      })
        .then((markup) => {
          // O SVG é gerado localmente a partir do payload — não vem de terceiros.
          this.svg.set(this.sanitizer.bypassSecurityTrustHtml(ajustarSvg(markup)));
        })
        .catch(() => this.svg.set(null));
    });
  }
}

/** Faz o SVG ocupar o contêiner em vez do tamanho fixo devolvido pela lib. */
function ajustarSvg(markup: string): string {
  return markup.replace('<svg', '<svg style="width:100%;height:auto;display:block"');
}
