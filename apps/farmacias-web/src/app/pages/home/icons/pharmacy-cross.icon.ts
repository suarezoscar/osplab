import { Component, input } from '@angular/core';

@Component({
  selector: 'icon-pharmacy-cross',
  template: `
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      [attr.width]="size()"
      [attr.height]="size()"
      aria-hidden="true"
    >
      <rect x="13" y="4" width="6" height="24" rx="2.5" />
      <rect x="4" y="13" width="24" height="6" rx="2.5" />
    </svg>
  `,
})
export class PharmacyCrossIconComponent {
  size = input<number>(28);
}
