import { Component, input, output } from '@angular/core';
import type { GeocodingSuggestion } from '../../../../services/geocoding.service';
import { PinIconComponent, SearchIconComponent, SpinnerIconComponent } from '../../icons/icons';

/**
 * Campo de búsqueda con autocompletado de direcciones.
 *
 * Muestra un dropdown de sugerencias de geocodificación que el
 * componente padre alimenta a través de los inputs.
 */
@Component({
  selector: 'app-address-search',
  imports: [PinIconComponent, SearchIconComponent, SpinnerIconComponent],
  templateUrl: './address-search.component.html',
})
export class AddressSearchComponent {
  searchQuery = input.required<string>();
  suggestions = input.required<GeocodingSuggestion[]>();
  showSuggestions = input.required<boolean>();
  loadingSuggestions = input.required<boolean>();
  disabled = input(false);

  readonly queryChange = output<string>();
  readonly suggestionSelected = output<GeocodingSuggestion>();
  readonly cleared = output<void>();
  readonly showSuggestionsChange = output<boolean>();
}
