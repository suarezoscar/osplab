import { render } from '@testing-library/angular';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

describe('LoadingSkeletonComponent', () => {
  it('renderiza exactamente 3 tarjetas skeleton', async () => {
    const { container } = await render(LoadingSkeletonComponent);
    const cards = container.querySelectorAll('.rounded-2xl');
    expect(cards.length).toBe(3);
  });

  it('tiene aria-hidden para no interferir con lectores de pantalla', async () => {
    const { container } = await render(LoadingSkeletonComponent);
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('aplica animation-delay diferente a cada tarjeta', async () => {
    const { container } = await render(LoadingSkeletonComponent);
    const cards = container.querySelectorAll('.rounded-2xl');
    const delays = Array.from(cards).map((c) => (c as HTMLElement).style.animationDelay);
    expect(delays[0]).toBe('0ms');
    expect(delays[1]).toBe('60ms');
    expect(delays[2]).toBe('120ms');
  });

  it('cada skeleton tiene la clase .skeleton para el efecto shimmer', async () => {
    const { container } = await render(LoadingSkeletonComponent);
    const skeletonEls = container.querySelectorAll('.skeleton');
    expect(skeletonEls.length).toBeGreaterThanOrEqual(3);
  });
});
