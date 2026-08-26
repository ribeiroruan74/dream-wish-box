import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Check, ExternalLink, Pencil, Store, Tag, Trash2 } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { ItemVisual } from "@/components/item-visual";
import { AddItemDialog } from "@/components/add-item-dialog";
import { Button } from "@/components/ui/button";

function storeDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function ProductDetailSheet({
  listId,
  itemId,
  onClose,
  onSelectItem,
}: {
  listId: string;
  itemId: string;
  onClose: () => void;
  onSelectItem: (itemId: string) => void;
}) {
  const { getList, getItem, toggleItemPurchased, removeItem, restoreItem } = useWishlist();
  const [editOpen, setEditOpen] = useState(false);
  const list = getList(listId);
  const item = getItem(listId, itemId);

  if (!list || !item) return null;

  const related = list.items.filter((i) => i.id !== item.id);
  const domain = item.url ? storeDomain(item.url) : null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center">
      <motion.button
        aria-label="Fechar"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-background sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-border sm:shadow-2xl"
      >
        <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar item"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remover item"
              onClick={() => {
                removeItem(listId, item.id);
                onClose();
                toast(`"${item.name}" removido`, {
                  action: {
                    label: "Desfazer",
                    onClick: () => restoreItem(listId, item),
                  },
                });
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </header>

        <AddItemDialog listId={listId} editItem={item} open={editOpen} onOpenChange={setEditOpen} />

        <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2">
          <ItemVisual
            item={item}
            emojiSize="text-6xl"
            layoutId={`item-visual-${item.id}`}
            className="mx-auto aspect-square w-full max-w-xs rounded-3xl border border-border shadow-sm"
          />

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{item.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {list.emoji} {list.name}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card py-3 text-center">
            <div className="flex flex-col items-center gap-1 px-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Preço</span>
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(item.price) ?? "—"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <Check className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-sm font-semibold text-foreground">
                {item.purchased ? "Comprado" : "Pendente"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loja</span>
              <span className="truncate text-sm font-semibold text-foreground">
                {domain ?? "—"}
              </span>
            </div>
          </div>

          {item.note && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">Sobre</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.note}</p>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">Mais dessa lista</h2>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                {related.map((sibling) => (
                  <button
                    key={sibling.id}
                    onClick={() => onSelectItem(sibling.id)}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border transition-transform active:scale-95"
                  >
                    <ItemVisual item={sibling} emojiSize="text-xl" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-full"
            onClick={() => toggleItemPurchased(listId, item.id)}
          >
            <Check className="h-4 w-4" />
            {item.purchased ? "Comprado ✓" : "Marcar comprado"}
          </Button>
          {item.url && (
            <Button asChild size="lg" className="flex-1 rounded-full">
              <a href={item.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Ver oferta
              </a>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
