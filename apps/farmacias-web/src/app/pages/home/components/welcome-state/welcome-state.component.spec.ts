import { render, screen } from '@testing-library/angular';
import { WelcomeStateComponent } from './welcome-state.component';
import { TranslocoTestingConfig } from '../../../../test-transloco';

describe('WelcomeStateComponent', () => {
  it('renderiza el título principal', async () => {
    await render(WelcomeStateComponent, { imports: [TranslocoTestingConfig] });
    expect(screen.getByText('¿Dónde estás?')).toBeTruthy();
  });

  it('renderiza el texto de instrucción', async () => {
    await render(WelcomeStateComponent, { imports: [TranslocoTestingConfig] });
    expect(screen.getByText(/usa tu ubicación o escribe una dirección/i)).toBeTruthy();
  });

  it('incluye la ilustración SVG con aria-label accesible', async () => {
    const { container } = await render(WelcomeStateComponent, {
      imports: [TranslocoTestingConfig],
    });
    const svg = container.querySelector('svg[aria-label]');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-label')).toMatch(/farmacia/i);
  });
});
