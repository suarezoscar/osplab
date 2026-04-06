import { Component, input } from '@angular/core';

@Component({
  selector: 'icon-pin',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.452-.24.757-.433.62-.384 1.445-.966 2.274-1.765C14.971 15.08 17 12.19 17 8A7 7 0 103 8c0 4.19 2.029 7.08 3.355 8.585.83.799 1.654 1.381 2.274 1.765a10.5 10.5 0 00.757.433 5.74 5.74 0 00.281.14l.018.008.006.003zM10 11.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z"
        clip-rule="evenodd"
      />
    </svg>
  `,
})
export class PinIconComponent {
  size = input<number>(14);
}
