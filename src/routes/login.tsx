import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Heart } from "lucide-react";
import { useProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — My Wishlist" }],
  }),
  component: LoginPage,
});

const AVATARS = ["💜", "🩵", "🧡", "💚", "🩷", "💛"];

function LoginPage() {
  const { profile, hydrated, login } = useProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]!);

  useEffect(() => {
    if (hydrated && profile) navigate({ to: "/" });
  }, [hydrated, profile, navigate]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    login({ name: name.trim(), email: email.trim(), avatar });
    navigate({ to: "/" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cta text-cta-foreground shadow-folder">
            <Heart className="h-7 w-7" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Entre para organizar e compartilhar suas listas de desejos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Como podemos te chamar?</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
              required
              className="h-12 rounded-full px-5 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
              className="h-12 rounded-full px-5 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Escolha um avatar</Label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatar(option)}
                  aria-pressed={avatar === option}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors ${
                    avatar === option ? "bg-cta text-cta-foreground" : "bg-muted hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full bg-cta text-cta-foreground hover:bg-cta/90"
          >
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Este é um login local: seu perfil fica salvo apenas neste dispositivo, sem senha nem conta
          na nuvem por enquanto.
        </p>
      </div>
    </main>
  );
}
