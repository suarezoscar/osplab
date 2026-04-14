import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  template: `
    <div class="flex flex-col gap-4" aria-hidden="true">
      @for (n of [1, 2, 3]; track n; let i = $index) {
        <div
          class="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
          [style.animation-delay]="i * 60 + 'ms'"
        >
          <div class="skeleton h-20 rounded-none"></div>
          <div class="p-5 flex flex-col gap-3">
            <div class="skeleton h-4 w-3/4 rounded-md"></div>
            <div class="skeleton h-4 w-1/2 rounded-md"></div>
            <div class="flex gap-2 mt-1">
              <div class="skeleton h-11 flex-1 rounded-xl"></div>
              <div class="skeleton h-11 flex-1 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LoadingSkeletonComponent {}
