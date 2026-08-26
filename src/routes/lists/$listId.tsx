import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Plus, Share2, Star, Trash2, Users } from "lucide-react";
import { RequireProfile } from "@/components/require-profile";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { useProfile } from "@/lib/profile-store";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { placeholderGradient } from "@/lib/placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/lists/$listId")({
  head: () => ({
    meta: [{ title: "Lista — My Wishlist" }],
  }),
  component: () => (
    <RequireProfile>
      <ListDetailPage />
    </RequireProfile>
  ),
});

const filters = ["Todos", "Pendentes", "Comprados"] as const;

function ListDetailPage() {
  const { listId } = useParams({ from: "/lists/$listId" });
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { getList, hydrated, updateList, toggleShared, togglePinned, removeList } = useWishlist();
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const list = getList(listId);

  if (!hydrated) return <div className="min-h-screen bg-background" />;

  if (!list) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-foreground">Essa lista não existe (ou foi removida).</p>
        <Button onClick={() => navigate({ to: "/" })}>Voltar</Button>
      </main>
    );
  }

  const visibleItems = list.items.filter((item) =>
    active === "Todos" ? true : active === "Comprados" ? item.purchased : !item.purchased,
  );

  const startEditing = () => {
    setNameDraft(list.name);
    setDescriptionDraft(list.description ?? "");
    setEditing(true);
  };

  const handleSaveEdit = (event: FormEvent) => {
    event.preventDefault();
    updateList(list.id, {
      name: nameDraft.trim() || list.name,
      description: descriptionDraft.trim() || undefined,
    });
    setEditing(false);
  };

  const handleDeleteList = () => {
    if (!confirm(`Excluir a lista "${list.name}"? Isso remove todos os itens dela.`)) return;
    removeList(list.id);
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Editar" onClick={startEditing}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir lista"
              onClick={handleDeleteList}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button
              size="sm"
              onClick={() => toggleShared(list.id)}
              className={`gap-1.5 rounded-full ${
                list.shared ? "bg-cta text-cta-foreground hover:bg-cta/90" : ""
              }`}
              variant={list.shared ? undefined : "secondary"}
            >
              <Share2 className="h-3.5 w-3.5" />
              {list.shared ? "Compartilhada" : "Share"}
            </Button>
          </div>
        </header>

        <div className="mt-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-lg ring-2 ring-background">
            {profile?.avatar}
          </div>
          {list.shared && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background">
              <Users className="h-4 w-4" />
            </div>
          )}
          <button
            onClick={() => togglePinned(list.id)}
            aria-pressed={list.pinned}
            aria-label="Fixar lista"
            className={`ml-1 rounded-full p-1.5 transition-colors ${
              list.pinned ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" fill={list.pinned ? "currentColor" : "none"} />
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="text-3xl font-bold h-auto py-2"
              autoFocus
            />
            <Textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              placeholder="Adicionar descrição..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Salvar
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="mt-4 flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <span>{list.emoji}</span>
              {list.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {list.description || "Adicionar descrição..."}
            </p>
          </>
        )}

        <div className="mt-6 flex gap-2">
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

        <section className="mt-6 grid grid-cols-2 gap-4">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setOpenItemId(item.id)}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div
                className="relative aspect-square w-full"
                style={item.imageUrl ? undefined : placeholderGradient(item.id)}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-4xl opacity-70">
                    🎁
                  </span>
                )}
                {item.purchased && (
                  <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-1 text-center text-[11px] font-semibold text-primary-foreground">
                    comprado
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold text-foreground">{item.name}</p>
                {formatPrice(item.price) && (
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                )}
              </div>
            </button>
          ))}
        </section>

        {visibleItems.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] flex justify-center">
        <AddItemDialog
          listId={list.id}
          trigger={
            <button className="flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-cta-foreground shadow-folder">
              <Plus className="h-4 w-4" />
              Add Wish
            </button>
          }
        />
      </div>

      {openItemId && (
        <ProductDetailSheet
          listId={list.id}
          itemId={openItemId}
          onClose={() => setOpenItemId(null)}
        />
      )}
    </main>
  );
}
