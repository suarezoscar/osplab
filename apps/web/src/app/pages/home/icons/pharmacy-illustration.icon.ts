import { Component } from '@angular/core';

@Component({
  selector: 'icon-pharmacy-illustration',
  template: `
    <svg
      viewBox="0 0 200 170"
      class="animate-float w-44 h-auto mx-auto mb-5 drop-shadow-sm"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustración de una farmacia"
    >
      <ellipse cx="100" cy="155" rx="72" ry="8" fill="#dcfce7" opacity="0.6" />
      <rect
        x="38"
        y="72"
        width="124"
        height="88"
        rx="4"
        fill="white"
        stroke="#bbf7d0"
        stroke-width="2"
      />
      <polygon
        points="28,74 100,24 172,74"
        fill="#dcfce7"
        stroke="#86efac"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <rect
        x="48"
        y="86"
        width="30"
        height="26"
        rx="4"
        fill="#f0fdf4"
        stroke="#86efac"
        stroke-width="1.5"
      />
      <line x1="63" y1="86" x2="63" y2="112" stroke="#bbf7d0" stroke-width="1" />
      <line x1="48" y1="99" x2="78" y2="99" stroke="#bbf7d0" stroke-width="1" />
      <rect
        x="122"
        y="86"
        width="30"
        height="26"
        rx="4"
        fill="#f0fdf4"
        stroke="#86efac"
        stroke-width="1.5"
      />
      <line x1="137" y1="86" x2="137" y2="112" stroke="#bbf7d0" stroke-width="1" />
      <line x1="122" y1="99" x2="152" y2="99" stroke="#bbf7d0" stroke-width="1" />
      <rect x="82" y="116" width="36" height="44" rx="4" fill="#86efac" />
      <circle cx="93" cy="140" r="2.5" fill="white" opacity="0.7" />
      <rect x="93" y="42" width="14" height="36" rx="3" fill="#16a34a" />
      <rect x="81" y="54" width="38" height="12" rx="3" fill="#16a34a" />
      <rect x="97" y="44" width="4" height="10" rx="2" fill="white" opacity="0.3" />
      <rect x="46" y="126" width="108" height="14" rx="3" fill="#15803d" opacity="0.9" />
      <text
        x="100"
        y="137"
        text-anchor="middle"
        font-family="system-ui,sans-serif"
        font-size="7.5"
        font-weight="700"
        fill="white"
        letter-spacing="1.5"
      >
        FARMACIA
      </text>
    </svg>
  `,
})
export class PharmacyIllustrationComponent {}
