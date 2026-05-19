import { getOwnerProfile } from "@/lib/db";
import { ProfileEditor } from "@/components/ProfileEditor";

export default async function DashboardProfilePage() {
  const profile = await getOwnerProfile();
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow"><span className="num-label">01</span> Кабинет специалиста</p>
        <h1 className="h1 mt-3">Профиль специалиста</h1>
        <p className="body-lg text-secondary mt-3 max-w-2xl">
          Точный адрес не публикуется. Запрещён эротический / интимный контент —
          он автоматически блокируется и отправляется на модерацию.
        </p>
      </header>
      <ProfileEditor profile={profile} />
    </div>
  );
}
