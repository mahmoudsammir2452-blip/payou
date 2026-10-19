(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  let pending = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight-innerHeight;
    progress.style.transform = 'scaleX('+(range > 0 ? Math.min(1,Math.max(0,scrollY/range)) : 0)+')';
    pending = false;
  };
  addEventListener('scroll',() => {if(!pending){pending=true;requestAnimationFrame(updateProgress)}},{passive:true});
  addEventListener('resize',updateProgress,{passive:true});
  updateProgress();
  if ('IntersectionObserver' in window && !preference.matches) {
    const targets = document.querySelectorAll('.strip,.section-top,.filters,.card,.how > div,.steps > div,.faq h2,.faq details,footer');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
    }),{threshold:.1});
    targets.forEach((target,i) => {
      target.classList.add('motion-enter');
      target.style.setProperty('--enter-delay',target.matches('.card,.steps > div') ? (i%3)*85+'ms' : '0ms');
      observer.observe(target);
    });
    document.documentElement.classList.add('motion-ready');
    preference.addEventListener('change',()=> {
      if(preference.matches){document.documentElement.classList.remove('motion-ready');observer.disconnect()}
    });
  }
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-paused',document.hidden));
})();
