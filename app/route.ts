import html from './catalog-html';
import {DB} from './admin-auth';
export async function GET(request?:Request){
 const rows=await DB().prepare('SELECT slug,data FROM catalog_overrides').all<{slug:string,data:string}>();
 const data=JSON.stringify(rows.results.map(r=>JSON.parse(r.data))).replace(/</g,'\\u003c');
 let page=html.replace('<script src="/assets/product-details.js',`<script id="payou-overrides" type="application/json">${data}</script><script src="/assets/catalog-data.js?v=1" defer></script><script src="/assets/product-details.js`);
 const preview=request?new URL(request.url).searchParams.get('preview'):null;
 const variants:Record<string,{file:string,className:string}>={studio:{file:'studio-preview',className:'studio-preview'},waves:{file:'waves-background',className:'waves-background'},calm:{file:'calm-background',className:'calm-preview'}};
 const variant=preview&&variants[preview]?variants[preview]:{file:'soft-background',className:'soft-background'};
 if(variant){
  page=page.replace('</head>','<link rel="stylesheet" href="/assets/'+variant.file+'.css?v=3"></head>').replace('<body>','<body class="'+variant.className+'">');
 }


 // Keep the mobile opening compact while preserving the existing orbit animation.
 page=page.replace('<h1>كل اللي بتحبّه.<br>في مكان <em>واحد.</em></h1>',
  '<h1><span data-payou-hero-ar="اشتراكاتك وخدماتك الرقمية،" data-payou-hero-en="Your digital subscriptions and services,">اشتراكاتك وخدماتك الرقمية،</span><br><em data-payou-hero-ar="في مكان واحد." data-payou-hero-en="all in one place.">في مكان واحد.</em></h1>');
 page=page.replace('</head>',`<style id="payou-mobile-refinement">
 @media(max-width:760px){
  body .hero{padding-top:18px;padding-bottom:8px;gap:4px;min-height:0}
  body .hero h1,html[lang=en] body .hero h1{font-size:clamp(27px,7.3vw,32px);line-height:1.35;margin:10px 0 12px;letter-spacing:-.5px}
  body .hero p{font-size:13px;line-height:1.75;margin:7px 0}
  body .hero .actions{margin-top:14px;gap:8px 12px}
  body .hero .primary{min-height:44px;padding:10px 16px;font-size:13px}
  body .hero .secondary{min-height:44px;font-size:11px}
  body .hero-note{font-size:10px;line-height:1.6;margin-top:7px}
  body .art{--orbit-radius:clamp(78px,23vw,91px);--orbit-tile-width:60px;--orbit-tile-height:66px;height:252px;max-width:290px;margin:0 auto;padding:0}
  body .art .shortcut-grid .tile{padding:7px 3px 5px;border-radius:14px}
  body .art .tile b{font-size:8.5px;min-height:23px;margin-top:3px}
  body .art .symbol,body .art .symbol.current-app-symbol{height:25px}
  body .art .current-app-symbol img{width:25px;height:25px}
  body .art .symbol svg{width:24px;height:24px}
  body .art .centerlogo .payou-artmark{width:92px}
  body .floating-whatsapp{min-height:44px!important;max-width:164px!important;padding:8px 11px!important;gap:7px;font-size:11px!important;border-radius:24px;box-shadow:0 4px 16px #0003}
  body .floating-whatsapp img{width:24px!important;height:24px!important}
  body .floating-whatsapp span{font-size:11px!important;white-space:nowrap}
  body .payment-peek{width:58px;min-height:52px;padding:8px 5px;font-size:11px;font-weight:700;line-height:1.5;color:#f1fff9;background:#234e4d;border:1px solid #a9e5d080;box-shadow:0 4px 14px #0003}
  body .payment-peek:hover,body .payment-peek[aria-expanded=true]{background:#2b625e;border-color:#c5f3df}
 }
 @media(max-width:350px){body .art{--orbit-radius:78px;height:232px}body .hero h1,html[lang=en] body .hero h1{font-size:26px}}
 </style></head>`);
 page=page.replace('</body>',`<script>
 (()=>{const update=()=>document.querySelectorAll('[data-payou-hero-ar]').forEach(el=>{
  el.textContent=document.documentElement.lang==='en'?el.dataset.payouHeroEn:el.dataset.payouHeroAr;
 });document.addEventListener('payou:languagechange',update);document.addEventListener('DOMContentLoaded',update);})();
 </script></body>`);

 return new Response(page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})
}
