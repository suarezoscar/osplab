import { Component } from '@angular/core';

@Component({
  selector: 'icon-no-results',
  template: `
    <svg
      viewBox="0 0 80 80"
      class="w-16 h-16 mx-auto mb-3 opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="34" cy="34" r="22" stroke="#d97706" stroke-width="3" />
      <line
        x1="50"
        y1="50"
        x2="68"
        y2="68"
        stroke="#d97706"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="28"
        y1="34"
        x2="40"
        y2="34"
        stroke="#d97706"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <line
        x1="34"
        y1="28"
        x2="34"
        y2="40"
        stroke="#d97706"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
  `,
})
export class NoResultsIconComponent {}
