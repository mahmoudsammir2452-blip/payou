(() => {
  const widget=document.querySelector('.payment-widget');
  const toggle=widget.querySelector('.payment-peek');
  const panel=widget.querySelector('.payment-panel');
  const close=widget.querySelector('.payment-panel-close');
  const setOpen=(open,focus=false)=>{
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    widget.classList.toggle('is-open',open);
    if(focus)(open?panel.querySelector('a'):toggle).focus({preventScroll:true});
  };
  toggle.addEventListener('click',event=>setOpen(panel.hidden,event.detail===0));
  close.addEventListener('click',()=>setOpen(false,true));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="#payments"]');
    if(link){event.preventDefault();setOpen(true,true);return}
    if(!panel.hidden&&!widget.contains(event.target))setOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!panel.hidden){event.preventDefault();setOpen(false,true)}
  });
  const localize=()=>{
    const en=document.documentElement.lang==='en';
    toggle.setAttribute('aria-label',en?'Show payment methods':'عرض طرق الدفع');
    close.setAttribute('aria-label',en?'Close payment methods':'إغلاق طرق الدفع');
    widget.setAttribute('aria-label',en?'Payment methods':'طرق الدفع');
  };
  document.addEventListener('payou:languagechange',localize);localize();
})();
