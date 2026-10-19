(() => {
 const t=(ar,en)=>window.payouText(ar,en),cards=[...document.querySelectorAll('.cards>.card')];
 const normalize=s=>s.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
 const search=document.createElement('input');search.type='search';search.id='catalog-search';search.className='catalog-search-input';search.maxLength=120;search.autocomplete='off';
 const tools=document.createElement('div');tools.className='catalog-tools';const label=document.createElement('label');label.htmlFor=search.id;label.className='sr-only';tools.append(label,search);document.querySelector('.filters').before(tools);
 const empty=document.createElement('p');empty.className='catalog-empty';empty.hidden=true;document.querySelector('.cards').after(empty);
 function filter(){const cat=document.querySelector('.filter.active')?.dataset.filter||'all',words=normalize(search.value).split(/\s+/).filter(Boolean);let visible=0;cards.forEach(c=>{c.hidden=c.dataset.cmsVisible==='false'||!(cat==='all'||cat===c.dataset.category)||!words.every(w=>normalize(c.querySelector('h3').textContent+' '+c.dataset.search+' '+c.dataset.categoryAr+' '+c.dataset.categoryEn).includes(w));if(!c.hidden)visible++});empty.hidden=visible>0}
 function localize(){label.textContent=t('ابحث عن اشتراك','Search subscriptions');search.placeholder=t('بتدور على اشتراك إيه؟','Find a subscription…');empty.textContent=t('مفيش نتائج. جرّب اسم تاني أو قسم تاني.','No results. Try another name or category.');filter()}
 search.addEventListener('input',filter);document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',filter));document.addEventListener('payou:languagechange',localize);localize();
 let session;try{session=sessionStorage.getItem('payou:visit')||crypto.randomUUID();sessionStorage.setItem('payou:visit',session)}catch{session=crypto.randomUUID()}
 cards.forEach(c=>c.querySelector('.order').addEventListener('click',()=>{fetch('/api/interest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:c.dataset.productSlug,event:'order',session}),keepalive:true}).catch(()=>{})}));
 function linked(){const params=new URLSearchParams(location.search),c=cards.find(c=>c.dataset.productSlug===params.get('product'));if(!c)return;search.value='';document.querySelector('.filter[data-filter="all"]').click();const select=c.querySelector('select'),plan=params.get('plan');if(select&&[...select.options].some(o=>o.value===plan)){select.value=plan;select.dispatchEvent(new Event('change',{bubbles:true}))}c.scrollIntoView({block:'center',behavior:'instant'});c.querySelector('select,.order')?.focus({preventScroll:true})}
 window.addEventListener('popstate',linked);linked();
})();
