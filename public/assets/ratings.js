(() => {
  const t=(ar,en)=>window.payouText?window.payouText(ar,en):ar;
  document.querySelectorAll('.card').forEach(card => {
    const product = card.querySelector('[data-product]')?.dataset.product;
    if (!product) return;
    const key = 'payou:rating:v1:' + (product === 'رصيد بطاقات أبل — مصر' ? 'شحن رصيد Apple — مصر' : product);
    let selected = 0;
    try { const stored = Number(localStorage.getItem(key)); if(Number.isInteger(stored) && stored >= 1 && stored <= 5) selected = stored; } catch {}
    const section = document.createElement('section');
    section.className = 'product-rating';
    section.setAttribute('aria-label','تقييمك لاشتراك ' + product);
    const heading = document.createElement('div');heading.className = 'rating-heading';
    const title = document.createElement('span');title.textContent = 'تقييمك للاشتراك';
    const value = document.createElement('span');value.className = 'rating-value';heading.append(title,value);
    const stars = document.createElement('div');stars.className='rating-stars';stars.setAttribute('role','radiogroup');stars.setAttribute('aria-label','اختار تقييم '+product+' من ١ إلى ٥');
    const buttons = [];
    const feedback=document.createElement('div');feedback.className='rating-feedback';
    const note=document.createElement('span');note.className='rating-note';note.setAttribute('role','status');
    const clear=document.createElement('button');clear.type='button';clear.className='rating-clear';clear.textContent='مسح تقييمي';
    const paint = (hover = selected) => buttons.forEach((b,i) => {b.classList.toggle('is-filled',i < hover);b.setAttribute('aria-checked',String(i+1 === selected));b.tabIndex = selected ? (i+1===selected?0:-1) : (i===0?0:-1)});
    let noteState = selected ? 'saved' : 'initial';
    const refresh = () => {
      section.setAttribute('aria-label',t('تقييمك لاشتراك ','Your rating for ')+card.querySelector('h3').textContent);
      title.textContent=t('تقييمك للاشتراك','Your rating');
      value.textContent=selected?selected+' / 5':t('لسه مقيّمتش','Not rated');
      stars.setAttribute('aria-label',t('اختار تقييم من ١ إلى ٥ لاشتراك ','Rate from 1 to 5: ')+card.querySelector('h3').textContent);
      clear.textContent=t('مسح تقييمي','Clear rating');clear.hidden=!selected;
      buttons.forEach((b,i)=>b.setAttribute('aria-label',(i+1)+t(' من 5',' out of 5')));
      note.textContent=noteState==='saved'?t('تقييمك محفوظ على الجهاز ده فقط.','Your rating is saved on this device only.'):noteState==='unavailable'?t('تم اختيار تقييمك؛ الحفظ على الجهاز غير متاح.','Rating selected. Saving on this device is unavailable.'):noteState==='cleared'?t('اختار عدد النجوم لتسجيل رأيك.','Choose stars to leave your rating.'):t('رأيك الشخصي — بيتحفظ على الجهاز ده فقط.','Your personal rating — saved on this device only.');
      paint();
    };
    document.addEventListener('payou:languagechange',refresh);
    const choose = n => {
      selected=n;
      let saved=true;
      try{if(n)localStorage.setItem(key,String(n));else localStorage.removeItem(key)}catch{saved=false}
      noteState=n?(saved?'saved':'unavailable'):'cleared';
      refresh();
    };
    for(let n=1;n<=5;n++){
      const button=document.createElement('button');button.type='button';button.className='rating-star';button.innerHTML="<svg class=\"ui-icon ui-rating-star\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" /> </svg>";button.setAttribute('role','radio');button.setAttribute('aria-label',n+' من 5');
      button.addEventListener('click',()=>choose(n));
      button.addEventListener('pointerenter',()=>paint(n));
      button.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight'||event.key==='ArrowUp') next=n===5?1:n+1;
        if(event.key==='ArrowLeft'||event.key==='ArrowDown') next=n===1?5:n-1;
        if(event.key==='Home') next=1;
        if(event.key==='End') next=5;
        if(next){event.preventDefault();choose(next);buttons[next-1].focus()}
      });
      buttons.push(button);stars.append(button);
    }
    stars.addEventListener('pointerleave',()=>paint());
    clear.addEventListener('click',()=>{choose(0);buttons[0].focus()});
    note.textContent=selected?'تقييمك محفوظ على الجهاز ده فقط.':'رأيك الشخصي — بيتحفظ على الجهاز ده فقط.';
    feedback.append(note,clear);section.append(heading,stars,feedback);
    card.querySelector('.order').before(section);
    refresh();
  });
})();
