import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OspLabFooterComponent, OspHeaderComponent } from '@osplab/shared-ui';

/** Página de política de privacidad de Farmacia de Guardia. */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink, OspLabFooterComponent, OspHeaderComponent],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  /** Fecha de la última actualización mostrada al usuario. */
  readonly updated = '6 de abril de 2026';
}
