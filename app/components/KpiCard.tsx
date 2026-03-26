interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon?: string;
}

export default function KpiCard({ label, value, sub, accent, icon }: KpiCardProps) {
  return (
    <div className={`rounded-xl p-4 border flex flex-col gap-1 ${
      accent
        ? "bg-orange-500/10 border-orange-500/30"
        : "bg-zinc-900 border-zinc-800"
    }`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-base">{icon}</span>}
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 truncate">{label}</div>
      </div>
      <div className={`text-2xl font-black leading-none ${accent ? "text-orange-400" : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  );
}
