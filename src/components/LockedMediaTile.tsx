export function LockedMediaTile({ title }: { title: string }) {
  return (
    <div className="flex aspect-[4/5] flex-col justify-between rounded-[24px] border border-dashed border-[#d7c3a2]/35 bg-[#d7c3a2]/8 p-5">
      <div className="rounded-full border border-[#d7c3a2]/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f0e2c7]">
        Private gallery
      </div>
      <div>
        <p className="font-serif text-2xl text-heading">{title}</p>
        <p className="mt-2 text-sm leading-7 text-body">
          Subscriber access required. Private assets remain locked until an active
          entitlement is confirmed.
        </p>
      </div>
    </div>
  );
}

