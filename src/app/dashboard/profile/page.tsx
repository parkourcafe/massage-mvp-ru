import { getOwnerProfile } from "@/lib/db";
import { ProfileEditor } from "@/components/ProfileEditor";

export default function DashboardProfilePage() {
  const profile = getOwnerProfile();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Профиль специалиста</h1>
      <p className="text-sm text-slate-600">
        Точный адрес не публикуется. Запрещён эротический / интимный контент —
        он автоматически блокируется и отправляется на модерацию.
      </p>
      <ProfileEditor profile={profile} />
    </div>
  );
}
