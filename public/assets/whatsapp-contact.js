(() => {
  const update = () => {
    const english = document.documentElement.lang === 'en';
    document.querySelectorAll('[data-wa-ar]').forEach(link => {
      link.href='https://wa.me/201015065426?text='+encodeURIComponent(english?link.dataset.waEn:link.dataset.waAr);
    });
  };
  document.addEventListener('payou:languagechange',update);
  update();
})();
