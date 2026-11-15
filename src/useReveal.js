import { useEffect } from 'react';

/* Adds `.is-visible` to every [data-reveal] element as it scrolls into view.
   Pass a changing `key` to pick up elements rendered later. */
export default function useReveal(key) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [key]);
}
