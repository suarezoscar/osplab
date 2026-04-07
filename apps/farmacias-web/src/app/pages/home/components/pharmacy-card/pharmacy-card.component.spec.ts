import { render, screen } from '@testing-library/angular';
import { PharmacyCardComponent } from './pharmacy-card.component';
import type { PharmacyDto } from '@osplab/shared-interfaces';

const BASE_PHARMACY: PharmacyDto = {
  id: 'ph-1',
  name: 'Farmacia Central',
  address: 'Rúa Maior, 1',
  phone: '986123456',
  city: 'Pontevedra',
  province: 'Pontevedra',
  distance: 350,
  startTime: '09:00',
  endTime: '21:00',
  lat: 42.431,
  lng: -8.643,
};

const PHARMACY_NO_COORDS: PharmacyDto = {
  id: 'ph-2',
  name: 'Farmacia Norte',
  address: 'Calle Norte, 5',
  city: 'Vigo',
  province: 'Pontevedra',
  distance: 1200,
};

const PHARMACY_24H: PharmacyDto = {
  ...BASE_PHARMACY,
  id: 'ph-3',
  startTime: '00:00',
  endTime: '00:00',
};

async function renderCard(pharmacy: PharmacyDto, index = 0) {
  return render(PharmacyCardComponent, {
    componentInputs: { pharmacy, index },
  });
}

describe('PharmacyCardComponent', () => {
  describe('Primera tarjeta (index = 0)', () => {
    it('muestra la franja ámbar "La más cercana"', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(screen.getByText(/la más cercana/i)).toBeTruthy();
    });

    it('NO muestra el badge de rank numérico en la cabecera', async () => {
      await renderCard(BASE_PHARMACY, 0);
      const rankBadges = document.querySelectorAll('[aria-hidden="true"]');
      const headerBadge = Array.from(rankBadges).find(
        (el) => el.classList.contains('bg-white/20') && el.textContent?.trim() === '1',
      );
      expect(headerBadge).toBeFalsy();
    });

    it('muestra el badge de distancia en ámbar', async () => {
      await renderCard(BASE_PHARMACY, 0);
      const article = screen.getByRole('article');
      const amberBadge = article.querySelector('.bg-amber-400');
      expect(amberBadge).toBeTruthy();
      expect(amberBadge?.textContent).toContain('350 m');
    });

    it('tiene aria-label correcto', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(
        screen.getByRole('article', { name: /La más cercana.*Farmacia Central/i }),
      ).toBeTruthy();
    });
  });

  describe('Tarjetas secundarias (index > 0)', () => {
    it('NO muestra la franja ámbar', async () => {
      await renderCard(BASE_PHARMACY, 1);
      expect(screen.queryByText(/la más cercana/i)).toBeNull();
    });

    it('muestra el badge de rank en la cabecera', async () => {
      await renderCard(BASE_PHARMACY, 1);
      const badge = document.querySelector('.bg-white\\/20');
      expect(badge?.textContent?.trim()).toBe('2');
    });

    it('tiene aria-label correcto para la segunda tarjeta', async () => {
      await renderCard(BASE_PHARMACY, 1);
      expect(
        screen.getByRole('article', { name: /Segunda más cercana.*Farmacia Central/i }),
      ).toBeTruthy();
    });

    it('tiene aria-label correcto para la tercera tarjeta', async () => {
      await renderCard(BASE_PHARMACY, 2);
      expect(
        screen.getByRole('article', { name: /Tercera más cercana.*Farmacia Central/i }),
      ).toBeTruthy();
    });
  });

  describe('Contenido de la tarjeta', () => {
    it('muestra nombre, ciudad y provincia', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(screen.getByText('Farmacia Central')).toBeTruthy();
      expect(screen.getByText(/Pontevedra, Pontevedra/i)).toBeTruthy();
    });

    it('muestra la dirección', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(screen.getByText('Rúa Maior, 1')).toBeTruthy();
    });

    it('muestra el horario cuando startTime ≠ endTime', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(screen.getByText('09:00 – 21:00')).toBeTruthy();
    });

    it('muestra "Guardia 24 horas" cuando startTime === endTime', async () => {
      await renderCard(PHARMACY_24H, 0);
      expect(screen.getByText(/guardia 24 horas/i)).toBeTruthy();
    });

    it('muestra el botón "Google Maps" cuando hay coordenadas', async () => {
      await renderCard(BASE_PHARMACY, 0);
      const link = screen.getByRole('link', { name: /google maps/i });
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toContain('42.431');
      expect(link.getAttribute('href')).toContain('google.com/maps');
    });

    it('muestra el botón "Apple Maps" cuando hay coordenadas', async () => {
      await renderCard(BASE_PHARMACY, 0);
      const link = screen.getByRole('link', { name: /apple maps/i });
      expect(link).toBeTruthy();
      const href = link.getAttribute('href')!;
      expect(href).toContain('maps.apple.com');
      expect(href).toContain('daddr=42.431');
      expect(href).toContain('dirflg=d');
    });

    it('NO muestra botones de navegación sin coordenadas', async () => {
      await renderCard(PHARMACY_NO_COORDS, 0);
      expect(screen.queryByRole('link', { name: /google maps/i })).toBeNull();
      expect(screen.queryByRole('link', { name: /apple maps/i })).toBeNull();
    });

    it('muestra el botón de llamada con el número de teléfono', async () => {
      await renderCard(BASE_PHARMACY, 0);
      const tel = screen.getByRole('link', { name: /llamar.*986123456/i });
      expect(tel.getAttribute('href')).toBe('tel:986123456');
    });

    it('NO muestra el botón de llamada sin teléfono', async () => {
      await renderCard(PHARMACY_NO_COORDS, 0);
      expect(screen.queryByRole('link', { name: /llamar/i })).toBeNull();
    });
  });

  describe('formatDistance', () => {
    it('formatea metros cuando < 1 km', async () => {
      await renderCard({ ...BASE_PHARMACY, distance: 750 }, 0);
      expect(screen.getByText('750 m')).toBeTruthy();
    });

    it('formatea kilómetros cuando ≥ 1 km', async () => {
      await renderCard({ ...BASE_PHARMACY, distance: 2500 }, 0);
      expect(screen.getByText('2.5 km')).toBeTruthy();
    });

    it('no muestra distancia si no hay valor', async () => {
      await renderCard({ ...PHARMACY_NO_COORDS, distance: undefined }, 0);
      const article = screen.getByRole('article');
      expect(article.querySelector('.bg-amber-400')).toBeNull();
    });
  });

  describe('ownerName opcional', () => {
    it('muestra el nombre del titular cuando está disponible', async () => {
      await renderCard({ ...BASE_PHARMACY, ownerName: 'Dr. García López' }, 0);
      expect(screen.getByText('Dr. García López')).toBeTruthy();
    });

    it('no renderiza el párrafo de titular si no hay ownerName', async () => {
      await renderCard(BASE_PHARMACY, 0);
      expect(screen.queryByText(/dr\./i)).toBeNull();
    });
  });
});
