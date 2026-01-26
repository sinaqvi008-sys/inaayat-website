
'use client';
import { useState, useEffect } from 'react';
import { savePin, getPin } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';
export default function AdminHome() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  useEffect(()=>{ const p = getPin(); if (p) router.replace('/admin/products'); },[router]);
  function login(){ if (!pin) return alert('Enter admin PIN'); savePin(pin); router.replace('/admin/products'); }
  return (
    <div className="container py-10 max-w-sm">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <p className="text-sm text-gray-600 mt-2">Enter your admin PIN to manage products.</p>
      <input className="input mt-4" type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Admin PIN" />
      <button className="btn btn-primary mt-3" onClick={login}>Continue</button>
    </div>
  );
}
