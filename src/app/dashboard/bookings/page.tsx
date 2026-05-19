import Link from "next/link";
import { getOwnerProfile, listBookingsForProfile } from "@/lib/db";
import { modalityLabel } from "@/lib/catalog";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s.includes("cancel") || s.includes("lost") || s.includes("declin"))
    return "badge bg-transparent text-mag-300";
  if (
    s.includes("confirm") ||
    s.includes("complete") ||
    s.includes("repeat") ||
    s.includes("client")
  )
    return "badge bg-plum-700 text-white";
  return "badge";
}

export default async function BookingsPage() {
  const owner = await getOwnerProfile();
  const bookings = await listBookingsForProfile(owner.id);

  const pending = bookings.filter((b) => {
    const s = b.status.toLowerCase();
    return !(
      s.includes("cancel") ||
      s.includes("lost") ||
      s.includes("declin") ||
      s.includes("confirm") ||
      s.includes("complete") ||
      s.includes("repeat") ||
      s.includes("client")
    );
  }).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">CRM · поток заявок</p>
          <h1 className="h1 mt-3">Заявки на запись</h1>
          <p className="small mt-3 max-w-xl">
            Единый поток заявки и переписки. Контакты и адрес клиента видны
            только вам и не публикуются.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-4 text-center">
            <p className="eyebrow text-secondary">Всего</p>
            <p className="num-label text-3xl mt-1">{bookings.length}</p>
          </div>
          <div
            className={`card px-5 py-4 text-center ${
              pending > 0 ? "bg-accent-soft border-accent" : ""
            }`}
          >
            <p className="eyebrow text-secondary">Ждут вас</p>
            <p className="num-label text-3xl mt-1 text-accent">{pending}</p>
          </div>
        </div>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-secondary border-b border-line">
              <th className="py-4 px-6 eyebrow">Клиент</th>
              <th className="py-4 pr-4 eyebrow">Услуга</th>
              <th className="py-4 pr-4 eyebrow">Формат</th>
              <th className="py-4 pr-4 eyebrow">Район</th>
              <th className="py-4 pr-4 eyebrow">Статус</th>
              <th className="py-4 pr-4 eyebrow">Последнее сообщение</th>
              <th className="py-4 pr-4 eyebrow">Обновлено</th>
              <th className="py-4 pr-6"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const last = (b.messages ?? [])[b.messages!.length - 1];
              return (
                <tr
                  key={b.id}
                  className="border-b border-line hover:bg-surface transition-colors"
                >
                  <td className="py-4 px-6 text-heading serif">
                    {b.client_name}
                  </td>
                  <td className="py-4 pr-4 text-body">
                    {b.service_type ? modalityLabel(b.service_type) : "—"}
                  </td>
                  <td className="py-4 pr-4 text-body">
                    {b.location_type ?? "—"}
                  </td>
                  <td className="py-4 pr-4 text-body">{b.district ?? "—"}</td>
                  <td className="py-4 pr-4">
                    <span className={statusBadge(b.status)}>{b.status}</span>
                  </td>
                  <td className="py-4 pr-4 max-w-[200px] truncate text-secondary">
                    {last?.body ?? "—"}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap text-secondary">
                    {new Date(b.updated_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-4 pr-6">
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="text-accent hover:underline"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-secondary">
                  Заявок пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
