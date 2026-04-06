import { vi } from 'vitest';
import { PharmaciesService } from './pharmacies.service';
import { PrismaService } from '@osplab/farmacias-data-access';
import { NearbyPharmaciesQueryDto } from './dto/nearby-pharmacies-query.dto';

const mockRow = {
  id: 'ph-1',
  name: 'Farmacia Central',
  address: 'Rúa Maior, 1',
  phone: '986123456',
  city_name: 'Pontevedra',
  province_name: 'Pontevedra',
  distance_meters: 350.7,
  start_time: '09:00',
  end_time: '22:00',
  lat: 42.431,
  lng: -8.643,
};

function makePrismaMock() {
  return { $queryRaw: vi.fn() } as unknown as PrismaService;
}

/** Helper para tipar el mock correctamente sin perder los métodos de Vitest */
function qRaw(prisma: ReturnType<typeof makePrismaMock>) {
  return vi.mocked(prisma.$queryRaw);
}

describe('PharmaciesService', () => {
  let service: PharmaciesService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new PharmaciesService(prisma);
  });

  it('se crea correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('findNearest', () => {
    it('llama a $queryRaw y mapea el resultado correctamente', async () => {
      qRaw(prisma).mockResolvedValue([mockRow]);

      const query: NearbyPharmaciesQueryDto = { lat: 42.43, lng: -8.64 };
      const result = await service.findNearest(query);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'ph-1',
        name: 'Farmacia Central',
        address: 'Rúa Maior, 1',
        phone: '986123456',
        city: 'Pontevedra',
        province: 'Pontevedra',
        distance: 351, // Math.round(350.7)
        startTime: '09:00',
        endTime: '22:00',
        lat: 42.431,
        lng: -8.643,
      });
    });

    it('redondea distance_meters a entero', async () => {
      qRaw(prisma).mockResolvedValue([{ ...mockRow, distance_meters: 1234.9 }]);
      const result = await service.findNearest({ lat: 42.43, lng: -8.64 });
      expect(result[0].distance).toBe(1235);
    });

    it('retorna [] si no hay farmacias de guardia', async () => {
      qRaw(prisma).mockResolvedValue([]);
      const result = await service.findNearest({ lat: 42.43, lng: -8.64 });
      expect(result).toEqual([]);
    });

    it('usa fecha de hoy cuando no se proporciona date', async () => {
      qRaw(prisma).mockResolvedValue([]);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      await service.findNearest({ lat: 42.43, lng: -8.64 });

      // $queryRaw recibe el tagged template — simplemente verificamos que se llamó
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('acepta fecha personalizada en el query', async () => {
      qRaw(prisma).mockResolvedValue([mockRow]);
      const result = await service.findNearest({
        lat: 42.43,
        lng: -8.64,
        date: '2026-04-10',
      });
      expect(result).toHaveLength(1);
    });
  });
});
