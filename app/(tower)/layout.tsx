import { AuthGate } from "@/components/AuthGate";
import { TowerNav } from "@/components/TowerNav";
import { TowerProviders } from "@/components/TowerProviders";

export default function TowerSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <TowerProviders>
      <AuthGate>
        <TowerNav />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">{children}</main>
      </AuthGate>
    </TowerProviders>
  );
}
