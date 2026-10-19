import {env} from 'cloudflare:workers';
import * as home from './app/route';
import * as adminPage from './app/admin/route';
import * as insights from './app/insights/route';
import * as admin from './app/api/admin/route';
import * as catalog from './app/api/catalog/route';
import * as interest from './app/api/interest/route';
import {schemaStatements} from './app/schema';
let schemaReady:Promise<unknown>|undefined;
async function ensureSchema(){
 if(!env.DB)throw new Error('Database binding missing');
 if(!schemaReady)schemaReady=env.DB.batch(schemaStatements.map(sql=>env.DB!.prepare(sql))).catch(error=>{schemaReady=undefined;throw error});
 await schemaReady;
}
const routes:Record<string,Record<string,(request:Request)=>Response|Promise<Response>>>={
 '/':{GET:home.GET},'/admin':{GET:adminPage.GET},'/insights':{GET:insights.GET},
 '/api/admin':{GET:admin.GET,POST:admin.POST},'/api/catalog':{GET:catalog.GET},'/api/interest':{POST:interest.POST}
};
export default {
 async fetch(request:Request,bindings:{ASSETS:Fetcher}):Promise<Response>{
  const url=new URL(request.url);const path=url.pathname;let response:Response;
  try{
   if(path==='/robots.txt')response=new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /insights\nDisallow: /api/\nSitemap: '+url.origin+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
   else if(path==='/sitemap.xml')response=new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+url.origin+'/</loc></url></urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
   else if(routes[path]){
    const method=request.method==='HEAD'?'GET':request.method;const handler=routes[path][method];
    if(!handler)return new Response('Method not allowed',{status:405,headers:{Allow:Object.keys(routes[path]).join(', ')}});
    if(path!=='/admin')await ensureSchema();
    response=await handler(request);
    if(path==='/'&&response.ok){const html=(await response.text()).replaceAll('https://payou.crispcharm11.chatgpt.site',url.origin);response=new Response(html,{status:response.status,headers:response.headers});}
   }else return bindings.ASSETS.fetch(request);
  }catch{return new Response('الموقع قيد التجهيز. يرجى مراجعة ربط قاعدة البيانات وإعدادات الإدارة.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});}
  const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
 }
};
