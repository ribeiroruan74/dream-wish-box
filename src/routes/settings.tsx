import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ChevronLeft, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { RequireProfile } from "@/components/require-profile";
import { BottomNav } from "@/components/bottom-nav";
import { useProfile } from "@/lib/profile-store";
import { useTheme, type ThemeChoice } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Ajustes — My Wishlist" }],
  }),
  component: () => (
    <RequireProfile>
      <SettingsPage />
    </RequireProfile>
  ),
});

const THEME_OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, logout } = useProfile();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile?.name ?? "");

  const handleSaveName = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim() });
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <main className="min-h-screen animate-in bg-background px-5 pb-28 pt-8 fade-in duration-500 ease-out sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>
        </header>

        <section className="mt-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
              {profile?.avatar}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">
                {profile?.email || "Sem e-mail cadastrado"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="mt-5 flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="settings-name">Nome</Label>
              <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary">
              Salvar
            </Button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Aparência
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  theme === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Conta
          </h2>
          <Button
            variant="outline"
            className="mt-3 w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          My Wishlist — seus dados ficam salvos apenas neste dispositivo por enquanto.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
