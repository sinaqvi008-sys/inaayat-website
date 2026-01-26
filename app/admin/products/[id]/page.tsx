
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Category, Product } from '@/lib/types';
import { getPin } from '@/lib/adminAuth';
import { useRouter, useParams } from 'next/navigation';
export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [cats, setCats] = useState<Category[]>([]);
  const [prod, setProd] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [price, setPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [inStock, setInStock] = useState(true);
  const [tags, setTags] = useState('');
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(()=>{ (async()=>{ const { data: c } = await supabase.from('categories').select('*').order('display_order', { ascending: true }); setCats(c||[]); const { data: p } = await supabase.from('products').select('*').eq('id', id).single(); setProd(p as any); if(p){ setTitle(p.title); setDescription(p.description||''); setCategoryId(p.category_id); setPrice(p.price); setMrp(p.mrp||''); setInStock(p.in_stock!==false); setTags((p.tags||[]).join(',')); } const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'); setExistingUrls((imgs||[]).map((x:any)=>x.url)); })(); },[id]);
  async function uploadImages(fs: File[]) { if (!fs.length) return []; const pin=getPin(); const form=new FormData(); fs.forEach(f=>form.append('files', f)); const res=await fetch('/api/admin/upload',{method:'POST',headers:{'x-admin-pin': pin||''}, body: form}); const json=await res.json(); if(!res.ok) throw new Error(json.error||'Upload failed'); return json.urls; }
  function removeUrl(u: string){ setExistingUrls(prev=>prev.filter(x=>x!==u)); }
  async function save(){ if(!title||!categoryId||!price){ alert('Fill mandatory fields'); return;} setBusy(true); try{ const added=await uploadImages(newFiles); const image_urls=[...existingUrls, ...added]; const pin=getPin(); const res=await fetch(`/api/admin/products/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json','x-admin-pin': pin||''}, body: JSON.stringify({ title, description, category_id: categoryId, price: Number(price), mrp: mrp===''?null:Number(mrp), in_stock: inStock, tags: tags?tags.split(',').map(t=>t.trim()):[], image_urls }) }); const json=await res.json(); if(!res.ok) throw new Error(json.error||'Could not save'); router.replace('/admin/products'); } catch(e:any){ alert(e.message);} finally { setBusy(false);} }
  if(!prod) return <div className="container py-6">Loading...</div>;
  return (
    <div className="container py-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Edit Product #{id}</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div><label className="text-sm">Title *</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-sm">Category *</label><select className="input" value={categoryId ?? ''} onChange={e=>setCategoryId(Number(e.target.value))}>{cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="text-sm">Price *</label><input className="input" type="number" value={price} onChange={e=>setPrice(e.target.value?Number(e.target.value):'')} /></div>
        <div><label className="text-sm">MRP</label><input className="input" type="number" value={mrp} onChange={e=>setMrp(e.target.value?Number(e.target.value):'')} /></div>
        <div className="md:col-span-2"><label className="text-sm">Description</label><textarea className="input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} /></div>
        <div><label className="text-sm">In Stock</label><select className="input" value={inStock?'true':'false'} onChange={e=>setInStock(e.target.value==='true')}><option value="true">Yes</option><option value="false">No</option></select></div>
        <div><label className="text-sm">Tags (comma separated)</label><input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="cotton,anarkali,summer" /></div>
      </div>
      <div className="mt-4"><label className="text-sm">Existing Images</label><div className="mt-2 flex flex-wrap gap-3">{existingUrls.map(u=>(<div key={u} className="relative"><img src={u} alt="img" className="h-28 w-20 object-cover rounded border" /><button className="absolute -top-2 -right-2 bg-white border rounded-full px-2 text-xs" onClick={()=>removeUrl(u)}>x</button></div>))}{!existingUrls.length&&<p className="text-sm text-gray-500">No images yet.</p>}</div></div>
      <div className="mt-4"><label className="text-sm">Add More Images</label><input className="input" type="file" multiple onChange={e=>setNewFiles(Array.from(e.target.files||[]))} /></div>
      <div className="mt-6 flex gap-3"><button className="btn btn-primary" onClick={save} disabled={busy}>{busy?'Saving...':'Save Changes'}</button></div>
    </div>
  );
}
