import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ChevronRight, Moon, Plus, Sun } from "lucide-react";
import { RequireProfile } from "@/components/require-profile";
import { BottomNav } from "@/components/bottom-nav";
import { ItemThumb } from "@/components/item-thumb";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
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

function ListRow({
  list,
  index,
  onOpenItem,
}: {
  list: WishlistList;
  index: number;
  onOpenItem: (itemId: string) => void;
}) {
  const { toggleShared } = useWishlist();

  return (
    <section
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out"
    >
      <div className="flex items-center justify-between">
        {list.pinned ? (
          <span className="text-sm" aria-hidden>
            📌
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={() => toggleShared(list.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            list.shared ? "bg-cta text-cta-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {list.shared ? "Compartilhada" : "Share"}
        </button>
      </div>

      <Link
        to="/lists/$listId"
        params={{ listId: list.id }}
        className="mt-2 flex items-center gap-1.5"
      >
        <h2 className="text-xl font-bold text-foreground">
          {list.name} {list.emoji}
        </h2>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{list.items.length}</span>
      </Link>

      <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
        {list.items.map((item) => (
          <ItemThumb key={item.id} item={item} size="sm" onClick={() => onOpenItem(item.id)} />
        ))}
        <Link
          to="/lists/$listId"
          params={{ listId: list.id }}
          className="flex h-28 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-transform active:scale-95"
          aria-label="Ver lista completa"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

function NewListDialog() {
  const { addList } = useWishlist();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const created = addList(name.trim(), emoji.trim() || undefined);
    setName("");
    setEmoji("");
    setOpen(false);
    navigate({ to: "/lists/$listId", params: { listId: created.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-cta-foreground shadow-folder transition-transform active:scale-95"
      >
        <Plus className="h-4 w-4" />
        New Wishlist
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
              <Label htmlFor="new-list-emoji">Emoji (opcional)</Label>
              <Input
                id="new-list-emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
                placeholder="🎁"
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
  const [openItem, setOpenItem] = useState<{ listId: string; itemId: string } | null>(null);

  const visible = [...lists]
    .filter((l) => {
      if (active === "Todos") return true;
      if (active === "Compartilhadas") return l.shared;
      if (active === "Comprados") return isDone(l);
      return !isDone(l);
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex animate-in items-start justify-between fade-in slide-in-from-top-2 duration-500 ease-out">
          <div>
            <p className="text-sm text-muted-foreground">Olá, {profile?.name?.split(" ")[0]} 👋</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">My Wishlist</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Alternar tema"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-border p-2 text-foreground transition-transform active:scale-90"
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-lg transition-transform active:scale-90"
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
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                active === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-10">
          {visible.map((list, index) => (
            <ListRow
              key={list.id}
              list={list}
              index={index}
              onOpenItem={(itemId) => setOpenItem({ listId: list.id, itemId })}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[4.75rem] flex justify-center">
        <NewListDialog />
      </div>

      <BottomNav />

      {openItem && (
        <ProductDetailSheet
          listId={openItem.listId}
          itemId={openItem.itemId}
          onClose={() => setOpenItem(null)}
        />
      )}
    </main>
  );
}
