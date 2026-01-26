
export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
