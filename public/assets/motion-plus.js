(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const art = document.querySelector('.art');
  const hero = document.querySelector('.hero');
  if (hero) {
    const waves = document.createElement('div');
    waves.className='hero-waves'; waves.setAttribute('aria-hidden','true');
    for(let i=0;i<3;i++) waves.append(document.createElement('i'));
    hero.prepend(waves);
  }
  if (art) {
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.classList.add('motion-connections');svg.setAttribute('aria-hidden','true');
    const shortcuts=[...art.querySelectorAll('.tile')];
    const paths=shortcuts.map((tile,i)=>{
      const base=document.createElementNS(ns,'path');base.classList.add('motion-path-base');
      const flow=document.createElementNS(ns,'path');flow.classList.add('motion-path-flow');flow.style.animationDelay=(-i*2)+'s';
      svg.append(base,flow);return {tile,base,flow};
    });
    art.prepend(svg);
    for(let i=0;i<2;i++){
      const track=document.createElement('div');track.className='orbit-track'+(i?' track-two':'');track.setAttribute('aria-hidden','true');art.append(track);
    }
    const layout=()=>{
      const w=art.clientWidth,h=art.clientHeight;
      svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const mark=art.querySelector('.centerlogo');
      const cx=mark.offsetLeft,cy=mark.offsetTop;
      paths.forEach(({tile,base,flow},i)=>{
        const tx=tile.offsetLeft+tile.offsetWidth/2,ty=tile.offsetTop+tile.offsetHeight/2;
        const bend=(i%2?1:-1)*42;
        const d=`M ${cx} ${cy} Q ${(cx+tx)/2+bend} ${(cy+ty)/2-bend} ${tx} ${ty}`;
        base.setAttribute('d',d);flow.setAttribute('d',d);
      });
    };
    if('ResizeObserver' in window)new ResizeObserver(layout).observe(art);
    else addEventListener('resize',layout,{passive:true});
    layout();
  }
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.card').forEach(card=>{
    let frame;
    const reset=()=>{cancelAnimationFrame(frame);card.classList.remove('pointer-active')};
    card.addEventListener('pointermove',event=>{
      if(reduce.matches||!fine.matches)return;
      const rect=card.getBoundingClientRect();
      const x=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width));
      const y=Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height));
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        card.style.setProperty('--tilt-x',(0.5-y)*6+'deg');card.style.setProperty('--tilt-y',(x-0.5)*7+'deg');
        card.style.setProperty('--spot-x',x*100+'%');card.style.setProperty('--spot-y',y*100+'%');card.classList.add('pointer-active');
      });
    },{passive:true});
    card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);
    reduce.addEventListener('change',reset);fine.addEventListener('change',reset);
  });
})();
