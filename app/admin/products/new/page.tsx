
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Category } from '@/lib/types';
import { getPin } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';
export default function NewProduct() {
  const [cats, setCats] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [price, setPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [inStock, setInStock] = useState(true);
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true }); setCats(data||[]); if (data&&data.length) setCategoryId(data[0].id); })(); },[]);
  async function uploadImages(fs: File[]) { if (!fs.length) return []; const pin=getPin(); const form=new FormData(); fs.forEach(f=>form.append('files', f)); const res=await fetch('/api/admin/upload',{method:'POST',headers:{'x-admin-pin': pin||''}, body: form}); const json=await res.json(); if(!res.ok) throw new Error(json.error||'Upload failed'); return json.urls; }
  async function submit(){ if(!title||!categoryId||!price){ alert('Fill mandatory fields'); return;} setBusy(true); try { const urls = await uploadImages(files); const pin=getPin(); const res = await fetch('/api/admin/products',{method:'POST', headers:{'Content-Type':'application/json','x-admin-pin':pin||''}, body: JSON.stringify({ title, description, category_id: categoryId, price: Number(price), mrp: mrp===''?null:Number(mrp), in_stock: inStock, tags: tags?tags.split(',').map(t=>t.trim()):[], image_urls: urls })}); const json = await res.json(); if(!res.ok) throw new Error(json.error||'Could not save'); router.replace('/admin/products'); } catch(e:any){ alert(e.message);} finally { setBusy(false);} }
  return (
    <div className="container py-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Add Product</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div><label className="text-sm">Title *</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-sm">Category *</label><select className="input" value={categoryId ?? ''} onChange={e=>setCategoryId(Number(e.target.value))}>{cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="text-sm">Price *</label><input className="input" type="number" value={price} onChange={e=>setPrice(e.target.value?Number(e.target.value):'')} /></div>
        <div><label className="text-sm">MRP</label><input className="input" type="number" value={mrp} onChange={e=>setMrp(e.target.value?Number(e.target.value):'')} /></div>
        <div className="md:col-span-2"><label className="text-sm">Description</label><textarea className="input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} /></div>
        <div><label className="text-sm">In Stock</label><select className="input" value={inStock?'true':'false'} onChange={e=>setInStock(e.target.value==='true')}><option value="true">Yes</option><option value="false">No</option></select></div>
        <div><label className="text-sm">Tags (comma separated)</label><input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="cotton,anarkali,summer" /></div>
      </div>
      <div className="mt-4"><label className="text-sm">Images</label><input className="input" type="file" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))} /><p className="text-xs text-gray-500 mt-1">You can select multiple images. They will upload when you click Save.</p></div>
      <div className="mt-6 flex gap-3"><button className="btn btn-primary" onClick={submit} disabled={busy}>{busy?'Saving...':'Save Product'}</button></div>
    </div>
  );
}
