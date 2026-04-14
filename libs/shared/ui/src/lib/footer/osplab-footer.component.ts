import { Component } from '@angular/core';
import { OspLabBadgeComponent } from '../osplab-badge/osplab-badge.component';

/**
 * Footer reutilizable para todos los proyectos de OSPLab.
 * Incluye badge, redes sociales (GitHub, LinkedIn, Ko-fi) y un slot
 * para contenido específico de cada app (versión, enlaces, etc.).
 *
 * Uso:
 *   <osplab-footer />
 *
 *   <osplab-footer>
 *     <p>Datos actualizados diariamente · v1.0.0</p>
 *   </osplab-footer>
 */
@Component({
  selector: 'osplab-footer',
  standalone: true,
  imports: [OspLabBadgeComponent],
  template: `
    <footer class="ospf">
      <osplab-badge />

      <nav aria-label="Redes sociales" class="ospf-nav">
        <a
          href="https://github.com/suarezoscar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil de Oscar Suarez en GitHub"
          class="ospf-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/oscarsuarezpayo/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil de Oscar Suarez en LinkedIn"
          class="ospf-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        </a>
        <a
          href="https://ko-fi.com/osplab"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apoya OSPLab en Ko-fi"
          class="ospf-link ospf-kofi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 5.966-.082 8.123c0 7.197 5.988 7.276 6.691 7.276l.323.001c.525 0 2.149-.047 3.374-.684 1.132-.589 1.659-1.567 1.659-1.567s1.147 1.869 4.914 1.869c4.853 0 5.074-4.702 5.074-4.702 0-2.197-.777-4.007-1.816-5.521zm-2.456 5.559c-.256 1.504-1.487 2.393-2.817 2.393-3.087 0-3.846-2.665-3.846-2.665s-.812 2.665-3.899 2.665c-1.33 0-2.561-.889-2.818-2.393-.289-1.695.029-3.553.029-3.553h13.322s.318 1.858.029 3.553zm-4.979-3.553h-5.887v-1.667h5.887v1.667zm2.021 0v-1.667h1.667v1.667h-1.667z"
            />
          </svg>
          <span>Ko-fi</span>
        </a>
      </nav>

      <ng-content />
    </footer>
  `,
  styles: [
    `
      .ospf {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        border-top: 1px solid var(--osp-footer-border, #f3f4f6);
        margin-top: 1rem;
        padding: 1.5rem 1rem;
        font-size: 0.75rem;
        color: var(--osp-footer-text, #9ca3af);
      }

      .ospf-nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .ospf-link {
        color: var(--osp-footer-icon, #9ca3af);
        transition: color 200ms;
      }

      .ospf-link:hover {
        color: var(--osp-footer-icon-hover, #374151);
      }

      .ospf-kofi {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 500;
      }

      .ospf-kofi:hover {
        color: var(--osp-footer-kofi-hover, #f59e0b);
      }
    `,
  ],
})
export class OspLabFooterComponent {}
