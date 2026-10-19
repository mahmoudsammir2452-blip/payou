(() => {
  const button = document.querySelector('.back-to-top');
  if (!button) return;
  let queued = false;
  const update = () => {
    button.hidden = window.scrollY < 500;
    queued = false;
  };
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, {passive: true});
  const localize = () => {
    const label = document.documentElement.lang === 'en' ? 'Back to top' : 'الرجوع لأول الصفحة';
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  button.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    document.querySelector('header a.logo')?.focus({preventScroll: true});
  });
  document.addEventListener('payou:languagechange', localize);
  window.addEventListener('pageshow', update);
  localize();
  update();
})();
