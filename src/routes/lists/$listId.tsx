import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Plus, Share2, Star, Trash2 } from "lucide-react";
import { RequireProfile } from "@/components/require-profile";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { ItemVisual } from "@/components/item-visual";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
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
    <main className="min-h-screen animate-in bg-background px-5 pb-32 pt-[calc(env(safe-area-inset-top)+1.5rem)] fade-in duration-500 ease-out sm:px-8">
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
            <button
              onClick={() => togglePinned(list.id)}
              aria-pressed={list.pinned}
              aria-label="Fixar lista"
              className={`rounded-full p-2 transition-colors ${
                list.pinned ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-4 w-4" fill={list.pinned ? "currentColor" : "none"} />
            </button>
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
              className={`gap-1.5 rounded-full active:scale-95 ${
                list.shared ? "bg-cta text-cta-foreground hover:bg-cta/90" : ""
              }`}
              variant={list.shared ? undefined : "secondary"}
            >
              <Share2 className="h-3.5 w-3.5" />
              {list.shared ? "Compartilhada" : "Share"}
            </Button>
          </div>
        </header>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="mt-6 space-y-3">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="h-auto py-2 text-3xl font-bold"
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
            <h1 className="mt-6 flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              {list.emoji && <span>{list.emoji}</span>}
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
          {visibleItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setOpenItemId(item.id)}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              className="flex animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm fade-in slide-in-from-bottom-2 duration-500 ease-out active:scale-[0.97]"
            >
              <div className="relative aspect-square w-full">
                <ItemVisual item={item} />
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
            <button className="flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-cta-foreground shadow-folder transition-transform active:scale-95">
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
