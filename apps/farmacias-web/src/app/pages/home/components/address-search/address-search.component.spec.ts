import { render, screen, fireEvent } from '@testing-library/angular';
import { AddressSearchComponent } from './address-search.component';
import type { GeocodingSuggestion } from '../../../../services/geocoding.service';

const SUGGESTIONS: GeocodingSuggestion[] = [
  { displayName: 'Santiago de Compostela, A Coruña', lat: 42.878, lng: -8.544 },
  { displayName: 'Vigo, Pontevedra', lat: 42.231, lng: -8.712 },
];

async function renderSearch({
  searchQuery = '',
  suggestions = [] as GeocodingSuggestion[],
  showSuggestions = false,
  loadingSuggestions = false,
  disabled = false,
} = {}) {
  return render(AddressSearchComponent, {
    componentInputs: { searchQuery, suggestions, showSuggestions, loadingSuggestions, disabled },
  });
}

describe('AddressSearchComponent', () => {
  describe('Input de búsqueda', () => {
    it('renderiza el campo de búsqueda', async () => {
      await renderSearch();
      expect(screen.getByRole('searchbox')).toBeTruthy();
    });

    it('muestra el placeholder correcto', async () => {
      await renderSearch();
      expect(screen.getByPlaceholderText(/ciudad, barrio, dirección/i)).toBeTruthy();
    });

    it('refleja el valor recibido por input', async () => {
      await renderSearch({ searchQuery: 'Santiago' });
      expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Santiago');
    });

    it('emite queryChange al escribir', async () => {
      const { fixture } = await renderSearch();
      const emitted: string[] = [];
      fixture.componentInstance.queryChange.subscribe((v: string) => emitted.push(v));

      fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'Vigo' } });
      expect(emitted).toContain('Vigo');
    });

    it('deshabilita el input cuando disabled=true', async () => {
      await renderSearch({ disabled: true });
      expect((screen.getByRole('searchbox') as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('Botón de limpiar', () => {
    it('muestra el botón "×" cuando hay texto', async () => {
      await renderSearch({ searchQuery: 'Vigo' });
      expect(screen.getByLabelText(/borrar búsqueda/i)).toBeTruthy();
    });

    it('NO muestra el botón "×" cuando el input está vacío', async () => {
      await renderSearch({ searchQuery: '' });
      expect(screen.queryByLabelText(/borrar búsqueda/i)).toBeNull();
    });

    it('emite cleared al hacer clic en "×"', async () => {
      const { fixture } = await renderSearch({ searchQuery: 'Vigo' });
      let count = 0;
      fixture.componentInstance.cleared.subscribe(() => count++);

      fireEvent.mouseDown(screen.getByLabelText(/borrar búsqueda/i));
      expect(count).toBe(1);
    });
  });

  describe('Spinner de sugerencias', () => {
    it('muestra el spinner cuando loadingSuggestions=true', async () => {
      await renderSearch({ loadingSuggestions: true });
      const input = screen.getByRole('searchbox');
      const parent = input.closest('.relative');
      const spinner = parent?.querySelector('svg.animate-spin');
      expect(spinner).toBeTruthy();
    });

    it('NO muestra el spinner cuando loadingSuggestions=false', async () => {
      await renderSearch({ loadingSuggestions: false });
      const input = screen.getByRole('searchbox');
      const parent = input.closest('.relative');
      const spinner = parent?.querySelector('svg.animate-spin');
      expect(spinner).toBeNull();
    });
  });

  describe('Dropdown de sugerencias', () => {
    it('muestra las sugerencias cuando showSuggestions=true', async () => {
      await renderSearch({ suggestions: SUGGESTIONS, showSuggestions: true });
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(screen.getByText('Santiago de Compostela, A Coruña')).toBeTruthy();
      expect(screen.getByText('Vigo, Pontevedra')).toBeTruthy();
    });

    it('NO muestra el listbox cuando showSuggestions=false', async () => {
      await renderSearch({ suggestions: SUGGESTIONS, showSuggestions: false });
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('NO muestra el listbox aunque showSuggestions=true si no hay sugerencias', async () => {
      await renderSearch({ suggestions: [], showSuggestions: true });
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('emite suggestionSelected al pulsar una sugerencia', async () => {
      const { fixture } = await renderSearch({ suggestions: SUGGESTIONS, showSuggestions: true });
      const emitted: GeocodingSuggestion[] = [];
      fixture.componentInstance.suggestionSelected.subscribe((s: GeocodingSuggestion) =>
        emitted.push(s),
      );

      fireEvent.mouseDown(screen.getByText('Vigo, Pontevedra').closest('button')!);
      expect(emitted[0]).toEqual(SUGGESTIONS[1]);
    });

    it('emite showSuggestionsChange(false) al perder el foco', async () => {
      const { fixture } = await renderSearch({ suggestions: SUGGESTIONS, showSuggestions: true });
      const emitted: boolean[] = [];
      fixture.componentInstance.showSuggestionsChange.subscribe((v: boolean) => emitted.push(v));

      fireEvent.blur(screen.getByRole('searchbox'));
      expect(emitted).toContain(false);
    });
  });
});
