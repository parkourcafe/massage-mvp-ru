import Link from "next/link";
import { getOwnerProfile, listBookingsForProfile } from "@/lib/db";
import { modalityLabel } from "@/lib/catalog";

export default function BookingsPage() {
  const owner = getOwnerProfile();
  const bookings = listBookingsForProfile(owner.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Заявки на запись</h1>
      <p className="text-sm text-slate-600">
        Единый поток заявки и переписки. Контакты и адрес клиента видны только
        вам и не публикуются.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">Клиент</th>
              <th className="py-2 pr-4">Услуга</th>
              <th className="py-2 pr-4">Формат</th>
              <th className="py-2 pr-4">Район</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2 pr-4">Последнее сообщение</th>
              <th className="py-2 pr-4">Обновлено</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const last = (b.messages ?? [])[b.messages!.length - 1];
              return (
                <tr key={b.id} className="border-t">
                  <td className="py-2 pr-4">{b.client_name}</td>
                  <td className="py-2 pr-4">
                    {b.service_type ? modalityLabel(b.service_type) : "—"}
                  </td>
                  <td className="py-2 pr-4">{b.location_type ?? "—"}</td>
                  <td className="py-2 pr-4">{b.district ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <span className="badge bg-slate-100 text-slate-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 max-w-[200px] truncate">
                    {last?.body ?? "—"}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(b.updated_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="text-brand-700 underline"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
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
