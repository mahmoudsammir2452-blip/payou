(() => {
  const t=(ar,en)=>window.payouText?window.payouText(ar,en):ar;
  const toggle=document.querySelector('.search-toggle');
  const dialog=document.createElement('dialog');dialog.className='site-search';dialog.setAttribute('aria-labelledby','search-title');
  dialog.innerHTML='<div class="search-heading"><h2 id="search-title"></h2><button type="button" class="search-close"><svg class="ui-icon " aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M18 6 6 18" /> <path d="m6 6 12 12" /> </svg></button></div><form role="search"><label class="search-label" for="search-input"></label><input id="search-input" class="search-input" type="search" autocomplete="off" maxlength="120"><p class="search-count" role="status" aria-live="polite"></p><div class="search-results"></div><p class="search-help"></p></form>';
  document.body.append(dialog);
  const input=dialog.querySelector('input'),results=dialog.querySelector('.search-results'),count=dialog.querySelector('.search-count');
  const cards=[...document.querySelectorAll('.card')];
  const aliases={ChatGPT:'chatgpt chat gpt openai شات جي بي تي شات جي بي تي شاتجبت شات جي بي تي ذكاء اصطناعي artificial intelligence ai study دراسة مذاكرة',Gemini:'gemini google جيميني جيميناي جيمني جيمناي جوجل ذكاء اصطناعي artificial intelligence ai study دراسة',Netflix:'netflix نتفليكس نتفلكس نيتفليكس ترفيه entertainment streaming movies series افلام مسلسلات'};
  const normalize=value=>value.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const targets=()=>[
    ...cards.filter(card=>card.dataset.cmsVisible!=='false').map(card=>({name:card.querySelector('h3').textContent,category:t(card.dataset.categoryAr,card.dataset.categoryEn),keywords:card.dataset.search||aliases[card.querySelector('h3').textContent]||'',node:card,product:true})),
    {name:t('طرق الدفع','Payment methods'),category:t('فودافون كاش، إنستاباي، فوري، تيلدا، باينانس','Vodafone Cash, InstaPay, Fawry, Telda, Binance'),keywords:'payment pay طرق دفع وسائل فودافون كاش انستاباي فوري فورى تيلدا تليدا telda fawry vodafone cash instapay binance باينانس بينانس',node:document.querySelector('#payments')},
    {name:t('إزاي تطلب؟','How to order'),category:t('دليل الطلب عبر واتساب','WhatsApp ordering guide'),keywords:'how order payment whatsapp delivery ازاي اطلب طريقه طلب دفع واتساب تسليم',node:document.querySelector('#how')},
    {name:t('أسئلة شائعة','Frequently asked questions'),category:t('إجابات عن الطلبات والاشتراكات','Ordering and subscription answers'),keywords:'faq help support questions price اسئله مساعده اسعار اشتراك',node:document.querySelector('#faq')}
  ];
  function render(){
    const words=normalize(input.value).split(' ').filter(Boolean);
    const found=targets().filter(item=>{const hay=normalize(item.name+' '+item.category+' '+item.keywords);return words.every(word=>hay.includes(word))});
    results.replaceChildren();
    count.textContent=words.length?t('عدد النتائج: ','Results: ')+found.length:t('الاشتراكات وروابط الوصول السريع','Subscriptions and quick links');
    if(!found.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent=t('مفيش نتائج. جرّب اسم المنتج أو القسم بالعربي أو الإنجليزي.','No results. Try a product or category in Arabic or English.');results.append(empty)}
    found.forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='search-result';
      const text=document.createElement('span'),name=document.createElement('b'),category=document.createElement('small'),arrow=document.createElement('span');
      name.textContent=item.name;category.textContent=item.category;arrow.innerHTML="<svg class=\"ui-icon ui-flow-arrow\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" /> </svg>";arrow.setAttribute('aria-hidden','true');text.append(name,category);button.append(text,arrow);
      button.addEventListener('click',()=>{
        if(item.product)document.querySelector('.filter[data-filter="all"]').click();
        dialog.close();
        if(item.node.id==='payments'){setTimeout(()=>document.querySelector('.payment-peek').click(),0);return;}
        item.node.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
        item.node.classList.add('jump-highlight');setTimeout(()=>item.node.classList.remove('jump-highlight'),2200);
        const focus=item.node.querySelector('button,summary');if(focus)focus.focus({preventScroll:true});
      });results.append(button);
    });
  }
  function localize(){
    toggle.setAttribute('aria-label',t('ابحث في الموقع','Search the site'));toggle.title=t('بحث','Search');
    dialog.querySelector('#search-title').textContent=t('بتدور على إيه؟','What are you looking for?');
    dialog.querySelector('.search-close').setAttribute('aria-label',t('إغلاق البحث','Close search'));
    dialog.querySelector('.search-label').textContent=t('ابحث عن اشتراك أو قسم','Search subscriptions or sections');
    input.placeholder=t('مثال: شات جي بي تي، نتفليكس…','Try ChatGPT, Netflix…');
    dialog.querySelector('.search-help').textContent=t('اختار نتيجة عشان توصّل لها مباشرة في الصفحة.','Choose a result to jump straight to it on the page.');render();
  }
  toggle.addEventListener('click',()=>{localize();dialog.showModal();document.body.classList.add('search-open');input.focus()});
  dialog.querySelector('.search-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.classList.remove('search-open');toggle.focus({preventScroll:true})});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close()}});
  dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();results.querySelector('button')?.click()});
  input.addEventListener('input',render);document.addEventListener('payou:languagechange',localize);localize();
})();
