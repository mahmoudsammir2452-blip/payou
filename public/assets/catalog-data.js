(() => {
 const records=JSON.parse(document.querySelector('#payou-overrides')?.textContent||'[]');window.payouCatalogOverrides=records;
 const t=(ar,en)=>document.documentElement.lang==='en'?(en||ar):ar;
 records.forEach(p=>{
  const card=[...document.querySelectorAll('[data-product-slug]')].find(c=>c.dataset.productSlug===p.slug);if(!card)return;
  card.dataset.cmsVisible=String(p.visible);if(!p.visible)card.hidden=true;
  const h=card.querySelector('h3'),body=card.querySelector('.cardbody');
  let description=[...body.children].find(n=>n.tagName==='P');if(!description){description=document.createElement('p');h.closest('.product-heading')?.after(description)}
  let benefits=body.querySelector('.product-benefits');if(!benefits){benefits=document.createElement('div');benefits.className='product-benefits';body.append(benefits)}
  let list=benefits.querySelector('ul');if(!list){list=document.createElement('ul');benefits.append(list)}
  let price=body.querySelector('.price');if(!price){price=document.createElement('div');price.className='price';body.append(price)}
  price.replaceChildren();const strong=document.createElement('strong');price.append(strong);
  let choices=body.querySelector('.apple-choice'),select=body.querySelector('select');
  if(p.plans.length&&!select){choices=document.createElement('div');choices.className='apple-choice';const label=document.createElement('label');select=document.createElement('select');select.id='cms-'+p.slug;label.htmlFor=select.id;label.textContent=t('اختار الباقة','Choose a plan');choices.append(label,select);body.append(choices)}
  const options=[];
  if(select){select.replaceChildren();if(p.plans.length){const placeholder=document.createElement('option');placeholder.value='';select.append(placeholder);options.push([placeholder,null]);p.plans.forEach(plan=>{const option=document.createElement('option');option.value=plan.id;select.append(option);options.push([option,plan])})}else{choices?.remove();select=null}}
  const render=()=>{
   h.textContent=t(p.nameAr,p.nameEn);description.textContent=t(p.descriptionAr,p.descriptionEn);strong.textContent=p.price===null?'':t(p.price+' جنيه','EGP '+p.price);list.replaceChildren();(document.documentElement.lang==='en'&&p.featuresEn.length?p.featuresEn:p.featuresAr).forEach(v=>{const li=document.createElement('li');li.textContent=v;list.append(li)});
   for(const [option,plan] of options){if(!plan){option.textContent=t('اختار الباقة','Choose a plan');continue}const label=t(plan.labelAr,plan.labelEn).replace(/\s*[—–-]?\s*(?:السعر\s*)?\d+\s*(?:جنيه|EGP)\s*$/i,'').trim();option.textContent=label+(plan.price===null?'':t(' — '+plan.price+' جنيه',' — EGP '+plan.price))}
   document.querySelectorAll('[data-jump]').forEach(button=>{const target=[...document.querySelectorAll('.order[data-product]')].find(o=>o.dataset.product===button.dataset.jump)?.closest('.card');if(target!==card)return;const offer=button.closest('.featured-offer');if(offer){offer.hidden=!p.visible;const label=offer.querySelector('.featured-price'),prices=p.plans.map(x=>x.price).filter(x=>x!==null);if(label)label.textContent=prices.length?t('من '+Math.min(...prices)+' جنيه','From EGP '+Math.min(...prices)):p.price!==null?t(p.price+' جنيه','EGP '+p.price):t('السعر على واتساب','Ask for price on WhatsApp')}});
   card.dataset.search=p.nameAr+' '+p.nameEn+' '+p.descriptionAr+' '+p.descriptionEn;
  };
  render();document.addEventListener('payou:languagechange',render);
 });
 // Existing filters continue to work while respecting hidden products.
 document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll('[data-cms-visible="false"]').forEach(c=>c.hidden=true)));
})();
