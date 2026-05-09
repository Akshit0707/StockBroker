const toSafeNumber = (value: unknown): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const toRupees = (value: unknown): number => toSafeNumber(value) / 100;

export const formatCurrency = (value: unknown): string => {
  const num = toSafeNumber(value); // expects rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};


export const formatPercent = (value: unknown): string => {
  const num = toSafeNumber(value);
  return `${num.toFixed(2)}%`;
};

export const formatValue = (value: unknown): string => {
  const num = toSafeNumber(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toString();
};

export const formatDate=(dateString:string):string=>{
    return new Intl.DateTimeFormat('en-IN',{
        year:'numeric',
        month:'short',
        day:'numeric',
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
        hour12:true
    }).format(new Date(dateString));
}

export const priceChangeColor=(value:number):string=>{
    if(value > 0){
        return "text-emerald-400";
    }
     if(value < 0){
        return 'text-rose-400';
    }
    return 'text-slate-400';
}

