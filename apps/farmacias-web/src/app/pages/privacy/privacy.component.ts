import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OspLabBadgeComponent } from '@osplab/shared-ui';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, OspLabBadgeComponent],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  readonly updated = '6 de abril de 2026';
}
