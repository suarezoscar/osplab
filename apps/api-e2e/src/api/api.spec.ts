import axios from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /api/pharmacies/nearest', () => {
  it('400 sin parámetros', async () => {
    await expect(axios.get('/api/pharmacies/nearest')).rejects.toMatchObject({
      response: { status: 400 },
    });
  });

  it('400 con lat no numérico', async () => {
    await expect(
      axios.get('/api/pharmacies/nearest', { params: { lat: 'abc', lng: 0 } }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('400 con lat fuera de rango', async () => {
    await expect(
      axios.get('/api/pharmacies/nearest', { params: { lat: 999, lng: 0 } }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });
});

describe('POST /api/admin/scrape', () => {
  it('POST /api/admin/scrape/cofourense → 202', async () => {
    const res = await axios.post('/api/admin/scrape/cofourense');
    expect(res.status).toBe(202);
  });

  it('POST /api/admin/scrape/cofpontevedra → 202', async () => {
    const res = await axios.post('/api/admin/scrape/cofpontevedra');
    expect(res.status).toBe(202);
  });
});
