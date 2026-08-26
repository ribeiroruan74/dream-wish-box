import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Moon, Plus, Sun } from "lucide-react";
import folderImg from "@/assets/folder-opaque.png";
import { RequireProfile } from "@/components/require-profile";
import { BottomNav } from "@/components/bottom-nav";
import { useProfile } from "@/lib/profile-store";
import { useTheme } from "@/lib/theme-provider";
import { useWishlist, type WishlistList } from "@/lib/wishlist-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Suas listas de desejos" },
      {
        name: "description",
        content:
          "Organize seus desejos em listas: presentes, viagens, tecnologia e mais. Marque o que já comprou e acompanhe o que falta.",
      },
      { property: "og:title", content: "My Wishlist — Suas listas de desejos" },
      {
        property: "og:description",
        content: "Organize seus desejos em listas e acompanhe o que já foi comprado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireProfile>
      <Index />
    </RequireProfile>
  ),
});

const filters = ["Todos", "Pendentes", "Comprados", "Compartilhadas"] as const;

function isDone(list: WishlistList) {
  return list.items.length > 0 && list.items.every((i) => i.purchased);
}

function ListCard({ list }: { list: WishlistList }) {
  const done = isDone(list);
  return (
    <Link
      to="/lists/$listId"
      params={{ listId: list.id }}
      className="group flex flex-col items-center gap-3"
    >
      <div className="relative mx-auto aspect-square w-full">
        <img
          src={folderImg}
          alt=""
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full select-none object-contain opacity-80 transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100"
        />
        <span className="pointer-events-none absolute inset-x-0 top-[62%] -translate-y-1/2 text-center text-[2.1rem] leading-none drop-shadow-md">
          {list.emoji}
        </span>
        {list.pinned && (
          <span className="absolute right-3 top-1 text-sm" aria-hidden>
            📌
          </span>
        )}
        {done && list.items.length > 0 && (
          <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            completa
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{list.name}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {list.items.length}
        </span>
        {list.shared && <span aria-label="Compartilhada">🤝</span>}
      </div>
    </Link>
  );
}

function NewListDialog() {
  const { addList } = useWishlist();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const created = addList(name.trim(), emoji.trim());
    setName("");
    setEmoji("📁");
    setOpen(false);
    navigate({ to: "/lists/$listId", params: { listId: created.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        aria-label="Nova lista"
        onClick={() => setOpen(true)}
        className="rounded-full bg-background p-2.5 text-foreground"
      >
        <Plus className="h-4 w-4" />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova lista</DialogTitle>
          <DialogDescription>
            Crie uma lista para organizar seus desejos por tema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="w-20 space-y-2">
              <Label htmlFor="new-list-emoji">Emoji</Label>
              <Input
                id="new-list-emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                className="text-center text-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-list-name">Nome da lista</Label>
              <Input
                id="new-list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aniversário, Natal, Casa nova..."
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Criar lista</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Index() {
  const { profile } = useProfile();
  const { lists } = useWishlist();
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");

  const visible = [...lists]
    .filter((l) => {
      if (active === "Todos") return true;
      if (active === "Compartilhadas") return l.shared;
      if (active === "Comprados") return isDone(l);
      return !isDone(l);
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);

  return (
    <main className="min-h-screen bg-background px-5 pb-28 pt-10 sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá, {profile?.name?.split(" ")[0]} 👋</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">My Wishlist</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Alternar tema"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-border p-2 text-foreground transition-colors hover:bg-muted"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <Link
              to="/settings"
              aria-label="Ajustes"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-lg"
            >
              {profile?.avatar}
            </Link>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <section className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3">
          {visible.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </section>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[4.75rem] flex justify-center">
        <div className="flex items-center gap-1 rounded-full bg-primary p-1.5 shadow-folder">
          <span className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground">
            {lists.length} listas
          </span>
          <NewListDialog />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
