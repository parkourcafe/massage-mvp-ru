export function AdminMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-secondary">{label}</p>
      <p className="mt-3 text-4xl text-heading">{value}</p>
      <p className="mt-2 text-sm leading-7 text-body">{detail}</p>
    </div>
  );
}

