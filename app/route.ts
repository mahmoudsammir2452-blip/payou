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

 return new Response(page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})
}
