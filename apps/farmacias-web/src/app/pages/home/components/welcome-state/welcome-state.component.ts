import { Component } from '@angular/core';
import { PharmacyIllustrationComponent } from '../../icons/icons';

@Component({
  selector: 'app-welcome-state',
  imports: [PharmacyIllustrationComponent],
  template: `
    <div class="text-center py-8 animate-fade-up">
      <icon-pharmacy-illustration />
      <p class="font-semibold text-gray-700 dark:text-gray-200 text-lg mb-1">¿Dónde estás?</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 leading-relaxed max-w-60 mx-auto">
        Usa tu ubicación o escribe una dirección para encontrar la farmacia de guardia más cercana
      </p>
    </div>
  `,
})
export class WelcomeStateComponent {}
