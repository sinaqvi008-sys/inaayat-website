
'use client';
const KEY = 'inaayat-admin-pin-v1';
export function savePin(pin: string) { localStorage.setItem(KEY, pin); }
export function getPin(): string | null { return localStorage.getItem(KEY); }
export function clearPin() { localStorage.removeItem(KEY); }
