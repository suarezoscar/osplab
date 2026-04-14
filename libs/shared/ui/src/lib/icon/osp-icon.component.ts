import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PHOSPHOR_ICONS } from './icon-registry';

/**
 * Phosphor icon component — renders SVG inline with currentColor.
 * Icons are sourced from @phosphor-icons/core via `scripts/generate-icon-registry.mjs`.
 *
 * Usage:
 *   <osp-icon name="map-pin" />
 *   <osp-icon name="calendar" [size]="24" />
 */
export type PhosphorWeight = 'regular' | 'bold' | 'light' | 'fill' | 'duotone';

@Component({
  selector: 'osp-icon',
  standalone: true,
  template: `<span [innerHTML]="svgHtml()" aria-hidden="true"></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
    `,
  ],
})
export class OspIconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly weight = input<PhosphorWeight>('regular');

  private readonly sanitizer = inject(DomSanitizer);

  readonly svgHtml = computed(() => {
    const iconData = PHOSPHOR_ICONS[this.name()];
    const paths = iconData?.[this.weight()] ?? iconData?.['regular'] ?? '';
    if (!paths) return this.sanitizer.bypassSecurityTrustHtml('');
    const s = this.size();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 256 256" fill="currentColor">${paths}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
