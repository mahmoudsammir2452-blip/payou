import {authenticated,DB,equal,json,limited,newSession,passwordHash,random,settings,sha} from '../../admin-auth';
import {catalog,validateProduct} from '../../catalog-store';
export async function GET(request:Request){
 const configured=!!await DB().prepare("SELECT id FROM admin_credentials WHERE id='owner'").first();const auth=await authenticated(request);
 if(new URL(request.url).searchParams.get('export')==='1'){
  if(!auth)return json({error:'غير مسموح'},401);
  return new Response(JSON.stringify({format:'payou-catalog-v1',exportedAt:new Date().toISOString(),products:await catalog()},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="payou-catalog-backup.json"','Cache-Control':'no-store'}})
 }
 return json({configured,authenticated:auth,...(auth?{products:await catalog()}:{})});
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'طلب غير مسموح'},403);
 let b:Record<string,unknown>;try{const raw=await request.text();if(raw.length>150000)return json({error:'الملف كبير'},413);b=JSON.parse(raw);if(!b||typeof b!=='object')throw 0}catch{return json({error:'بيانات غير صالحة'},400)}
 const action=b.action;
 if(['setup','login','recover'].includes(String(action))){
  if(!settings().PAYOU_ADMIN_PEPPER)return json({error:'إعداد الإدارة غير مكتمل'},503);
  if(await limited(request))return json({error:'محاولات كتير. جرّب بعد ١٥ دقيقة.'},429);
  const password=b.password;if(typeof password!=='string'||password.length<16||password.length>128)return json({error:'استخدم كلمة مرور بين ١٦ و١٢٨ حرفًا.'},400);
  const row=await DB().prepare("SELECT salt,hash,recovery FROM admin_credentials WHERE id='owner'").first<{salt:string,hash:string,recovery:string}>();
  if(action==='setup'){
   if(row)return json({error:'لوحة الإدارة اتفعلت بالفعل. سجّل دخولك.'},409);
   if(typeof b.token!=='string'||!settings().PAYOU_ADMIN_SETUP_HASH||!equal(await sha(b.token),settings().PAYOU_ADMIN_SETUP_HASH!))return json({error:'رابط التفعيل غير صحيح'},403);
   const salt=random(),recovery=random();const result=await DB().prepare("INSERT OR IGNORE INTO admin_credentials(id,salt,hash,recovery) VALUES ('owner',?,?,?)").bind(salt,await passwordHash(password,salt),await sha(recovery)).run();
   if(result.meta.changes!==1)return json({error:'تم التفعيل بالفعل'},409);
   return json({ok:true,recovery},200,{'Set-Cookie':await newSession()});
  }
  if(!row)return json({error:'بيانات الدخول غير صحيحة'},401);
  if(action==='login'){
   if(!equal(row.hash,await passwordHash(password,row.salt)))return json({error:'بيانات الدخول غير صحيحة'},401);
   return json({ok:true},200,{'Set-Cookie':await newSession()});
  }
  if(typeof b.recovery!=='string'||!equal(row.recovery,await sha(b.recovery)))return json({error:'رمز الاسترداد غير صحيح'},401);
  const salt=random(),recovery=random();await DB().batch([DB().prepare("UPDATE admin_credentials SET salt=?,hash=?,recovery=? WHERE id='owner'").bind(salt,await passwordHash(password,salt),await sha(recovery)),DB().prepare('DELETE FROM admin_sessions')]);
  return json({ok:true,recovery},200,{'Set-Cookie':await newSession()});
 }
 if(!await authenticated(request))return json({error:'سجّل الدخول أولًا'},401);
 if(action==='logout'){
  const token=request.headers.get('cookie')?.match(/__Host-payou_admin=([a-f0-9]{64})/)?.[1];if(token)await DB().prepare('DELETE FROM admin_sessions WHERE token=?').bind(await sha(token)).run();return json({ok:true},200,{'Set-Cookie':'__Host-payou_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
 }
 if(action==='password'){
  const row=await DB().prepare("SELECT salt,hash FROM admin_credentials WHERE id='owner'").first<{salt:string,hash:string}>();
  if(!row||typeof b.current!=='string'||!equal(row.hash,await passwordHash(b.current,row.salt)))return json({error:'كلمة المرور الحالية غير صحيحة'},403);
  if(typeof b.password!=='string'||b.password.length<16||b.password.length>128)return json({error:'كلمة المرور الجديدة لازم تكون ١٦ حرفًا على الأقل'},400);
  const salt=random();await DB().batch([DB().prepare("UPDATE admin_credentials SET salt=?,hash=? WHERE id='owner'").bind(salt,await passwordHash(b.password,salt)),DB().prepare('DELETE FROM admin_sessions')]);return json({ok:true},200,{'Set-Cookie':await newSession()});
 }
 if(action==='save'){
  const p=validateProduct(b.product);if(!p)return json({error:'راجع بيانات المنتج والأسعار'},400);
  const {version,...data}=p;
  const result=await DB().prepare('INSERT INTO catalog_overrides(slug,data,version) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET data=excluded.data,version=excluded.version WHERE CAST(catalog_overrides.version AS INTEGER)=?').bind(p.slug,JSON.stringify(data),String(version+1),version).run();
  if(result.meta.changes!==1)return json({error:'المنتج اتغير من جلسة تانية. حدّث الصفحة قبل الحفظ.'},409);
  return json({ok:true,version:version+1});
 }
 if(action==='restore'){
  const backup=b.backup as {format?:string,products?:unknown[]};
  if(!backup||backup.format!=='payou-catalog-v1'||!Array.isArray(backup.products)||backup.products.length!==33)return json({error:'ملف النسخة الاحتياطية غير صالح'},400);
  const ps=backup.products.map(validateProduct);if(ps.some(p=>!p)||new Set(ps.map(p=>p!.slug)).size!==33)return json({error:'المنتجات في النسخة غير صالحة'},400);
  await DB().batch(ps.map(p=>DB().prepare('INSERT INTO catalog_overrides(slug,data,version) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET data=excluded.data,version=CAST(CAST(catalog_overrides.version AS INTEGER)+1 AS TEXT)').bind(p!.slug,JSON.stringify(p),String(p!.version+1))));return json({ok:true});
 }
 return json({error:'طلب غير معروف'},400);
}
