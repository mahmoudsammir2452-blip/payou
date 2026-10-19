import {authenticated} from '../admin-auth';
import {env} from 'cloudflare:workers';
import {products} from '../products';
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function GET(request:Request){
 if(!await authenticated(request))return new Response(null,{status:302,headers:{Location:'/admin','Cache-Control':'no-store'}});
 const r=await env.DB!.prepare(`SELECT product,event,COUNT(*) AS total FROM product_interest WHERE day>=date('now','-29 days') GROUP BY product,event`).all<{product:string,event:string,total:number}>();
 const events=['details','order','cart_request','renew','support'];
 const rows=products.map(p=>[p.name,...events.map(e=>r.results.find(x=>x.product===p.slug&&x.event===e)?.total||0)]);
 const headers=['المنتج','فتح التفاصيل','طلب منفرد','طلب مجمّع','تجديد','دعم'];
 if(new URL(request.url).searchParams.get('format')==='csv')return new Response('\ufeff'+[headers,...rows].map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="payou-interest.csv"','Cache-Control':'no-store'}});
 return new Response(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>إحصاءات بايو</title><style>body{font-family:Tahoma,Arial;background:#101827;color:#e7f1ff;margin:0;padding:24px;line-height:1.8}main{max-width:1050px;margin:auto}a{color:#8ac4ff;margin-inline-end:20px}table{border-collapse:collapse;width:100%;min-width:650px}td,th{padding:12px;border-bottom:1px solid #ffffff22;text-align:start}.table{overflow:auto}p{color:#b8cbe2}</style><main><h1>اهتمام العملاء بالمنتجات</h1><p>آخر ٣٠ يومًا — اليوم محسوب بتوقيت UTC. يُحسب كل نوع تفاعل مرة واحدة لكل جلسة متصفح ولكل منتج في اليوم. الأرقام تقديرية وقد تتضمن نشاطًا آليًا؛ ليست عدد العملاء أو المبيعات المؤكدة.</p><a href="/">المتجر</a><a href="/insights?format=csv">تنزيل CSV</a><div class="table"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>لا نحفظ كلمات بحث أو محتوى رسائل واتساب أو كلمات سر. المعرّف المستخدم للعدّ مؤقت ويتغير بين الجلسات والأيام.</p></main></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}})
}
