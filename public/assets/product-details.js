(() => {
 const t=(ar,en)=>window.payouText(ar,en),updates=[];
 const durationDefaults={shahid:['3 شهور','3 months'],'youtube-premium':['شهر واحد','1 month'],spotify:['شهر واحد','1 month'],'chatgpt-plus':['شهر واحد','1 month'],'claude-api':['30 يوم','30 days'],canva:['3 سنوات','3 years'],capcut:['30 يوم','30 days'],'adobe-express':['12 شهر','12 months']};
 const durations={...durationDefaults};for(const p of window.payouCatalogOverrides||[])durations[p.slug]=[p.durationAr,p.durationEn];
 document.querySelectorAll('.cards>.card').forEach(card=>{
  card.classList.add('simple-shop','balanced-shop');
  const body=card.querySelector('.cardbody'),heading=body.querySelector('.product-heading')||body.querySelector('h3'),order=body.querySelector('.order'),select=body.querySelector('select'),price=body.querySelector('.price');
  const description=[...body.children].find(n=>n.tagName==='P'),benefits=body.querySelector('.product-benefits');
  const choices=select?.closest('.apple-choice')||select,sourceChildren=[...body.children];
  const extra=document.createElement('details');extra.className='simple-extra';const summary=document.createElement('summary');extra.append(summary);
  const features=document.createElement('details');features.className='subscription-features';const featureSummary=document.createElement('summary');features.append(featureSummary);
  if(benefits){benefits.querySelector('h4')?.remove();features.append(benefits)}
  const priceLine=document.createElement('div');priceLine.className='simple-price';
  const fixedNode=price?.querySelector('strong');
  const optionAmount=o=>[...o.textContent.matchAll(/(\d+)\s*(?:جنيه|EGP)/gi)].at(-1)?.[1];
  const priceOptions=select?[...select.options].filter(o=>o.value&&o.value!=='custom'&&optionAmount(o)):[];
  const initialPrice=price?.textContent.replace(/\s+/g,' ').trim()||'';
  const numeric=initialPrice.match(/(?:^|\s)(\d+)\s*(?:جنيه|EGP)/i)?.[1];
  const planCards=document.createElement('div');planCards.className='visible-plan-options';
  const usePlanCards=priceOptions.length>1&&priceOptions.length<=4;
  if(usePlanCards)priceOptions.forEach(option=>{
   const button=document.createElement('button');button.type='button';button.className='visible-plan-option';
   const label=document.createElement('span'),amount=document.createElement('strong');button.append(label,amount);
   const render=()=>{const n=optionAmount(option);label.textContent=option.textContent.replace(/\s*[—–-]?\s*(?:السعر\s*)?\d+\s*(?:جنيه|EGP)\s*$/i,'').trim();amount.textContent=t(n+' جنيه','EGP '+n);button.setAttribute('aria-pressed',String(select.value===option.value));};
   button.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}))});select.addEventListener('change',render);updates.push(render);render();planCards.append(button);
  });
  const update=()=>{
   summary.textContent=t('تفاصيل الاستخدام (اختياري)','Usage details (optional)');featureSummary.textContent=t('مميزات الاشتراك','Subscription features');
   const selected=select?.selectedOptions[0],chosenAmount=selected?.value&&selected.value!=='custom'?optionAmount(selected):null;
   if(chosenAmount)priceLine.textContent=t(chosenAmount+' جنيه','EGP '+chosenAmount);
   else if(priceOptions.length)priceLine.textContent=t('الباقات من '+Math.min(...priceOptions.map(o=>Number(optionAmount(o))))+' جنيه','Plans from EGP '+Math.min(...priceOptions.map(o=>Number(optionAmount(o)))));
   else if(fixedNode)priceLine.textContent=fixedNode.textContent.replace(/\s+/g,' ').trim();
   else if(numeric)priceLine.textContent=t(numeric+' جنيه','EGP '+numeric);
   else priceLine.textContent=t('السعر حسب الباقة — اسألنا على واتساب','Price depends on the plan — ask on WhatsApp');
   if(selected?.value==='custom')priceLine.textContent=t('مبلغ مخصص — السعر على واتساب','Custom amount — ask for price on WhatsApp');
   const duration=durations[card.dataset.productSlug];if(duration)priceLine.textContent+=' · '+t(...duration);
   const orderLabel=order.querySelector('.order-label');if(orderLabel)orderLabel.textContent=t('اطلب على واتساب','Order on WhatsApp');
  };
  select?.addEventListener('change',update);
  sourceChildren.forEach(n=>{if(n!==heading&&n!==description&&n!==benefits&&n!==order&&n!==choices)extra.append(n)});
  body.replaceChildren(heading);if(description){description.classList.add('balanced-description');body.append(description)}body.append(priceLine);
  if(usePlanCards){choices.hidden=true;body.append(planCards,choices)}else if(choices)body.append(choices);
  if(benefits)body.append(features);
  const privacy=document.createElement('p');privacy.className='simple-privacy';
  if(select?.id==='gpt-plan'){
   body.append(privacy);const show=()=>{privacy.hidden=select.value!=='shared';privacy.textContent=t('الحساب المشترك: خصوصية المحادثات غير مضمونة.','Shared account: conversation privacy is not assured.')};
   select.addEventListener('change',show);updates.push(show);show();
  }
  body.append(order);if(extra.children.length>1)body.append(extra);order.classList.add('simple-order');updates.push(update);update();
 });
 document.addEventListener('payou:languagechange',()=>updates.forEach(fn=>fn()));
})();
