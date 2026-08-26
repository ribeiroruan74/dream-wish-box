import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, ChevronLeft, Plus, Share2, Star, Trash2 } from "lucide-react";
import { RequireProfile } from "@/components/require-profile";
import { useWishlist } from "@/lib/wishlist-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function formatPrice(value?: number) {
  if (value == null) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ListDetailPage() {
  const { listId } = useParams({ from: "/lists/$listId" });
  const navigate = useNavigate();
  const {
    getList,
    hydrated,
    addItem,
    toggleItemPurchased,
    removeItem,
    toggleShared,
    togglePinned,
    removeList,
  } = useWishlist();
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");
  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState("");

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

  const handleAddItem = (event: FormEvent) => {
    event.preventDefault();
    if (!newItem.trim()) return;
    const price = newPrice.trim() ? Number(newPrice.replace(",", ".")) : undefined;
    addItem(list.id, newItem.trim(), Number.isFinite(price) ? price : undefined);
    setNewItem("");
    setNewPrice("");
  };

  const handleDeleteList = () => {
    if (!confirm(`Excluir a lista "${list.name}"? Isso remove todos os itens dela.`)) return;
    removeList(list.id);
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background px-5 pb-16 pt-8 sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/" })}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                <span>{list.emoji}</span>
                {list.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {list.items.filter((i) => i.purchased).length} de {list.items.length} comprados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ListActionButton
              active={list.pinned}
              label="Fixar"
              onClick={() => togglePinned(list.id)}
              icon={Star}
            />
            <ListActionButton
              active={list.shared}
              label="Compartilhada"
              onClick={() => toggleShared(list.id)}
              icon={Share2}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir lista"
              onClick={handleDeleteList}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </header>

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

        <form onSubmit={handleAddItem} className="mt-6 flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Adicionar item..."
            className="flex-1"
          />
          <Input
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="R$"
            inputMode="decimal"
            className="w-24"
          />
          <Button type="submit" size="icon" aria-label="Adicionar item">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <ul className="mt-6 space-y-2">
          {visibleItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <button
                onClick={() => toggleItemPurchased(list.id, item.id)}
                aria-pressed={item.purchased}
                aria-label={item.purchased ? "Marcar como pendente" : "Marcar como comprado"}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  item.purchased
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input"
                }`}
              >
                {item.purchased && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-medium ${
                    item.purchased ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {item.name}
                </p>
                {formatPrice(item.price) && (
                  <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                )}
              </div>
              <button
                onClick={() => removeItem(list.id, item.id)}
                aria-label="Remover item"
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        {visibleItems.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
        )}
      </div>
    </main>
  );
}

function ListActionButton({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: typeof Star;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={active ? "text-primary" : "text-muted-foreground"}
    >
      <Icon className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </Button>
  );
}
