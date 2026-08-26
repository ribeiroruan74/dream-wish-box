import { ArrowLeft, Check, ExternalLink, Trash2 } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { ItemVisual } from "@/components/item-visual";
import { Button } from "@/components/ui/button";

export function ProductDetailSheet({
  listId,
  itemId,
  onClose,
}: {
  listId: string;
  itemId: string;
  onClose: () => void;
}) {
  const { getItem, toggleItemPurchased, removeItem } = useWishlist();
  const item = getItem(listId, itemId);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-30 flex animate-in flex-col bg-background slide-in-from-bottom-6 fade-in duration-300 ease-out">
      <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remover item"
          onClick={() => {
            removeItem(listId, item.id);
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{item.name}</h1>

        <div className="mt-5 aspect-square w-full overflow-hidden rounded-3xl border border-border shadow-sm">
          <ItemVisual item={item} emojiSize="text-6xl" />
        </div>

        {formatPrice(item.price) && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <span className="text-sm text-muted-foreground">Preço</span>
            <span className="text-lg font-semibold text-foreground">{formatPrice(item.price)}</span>
          </div>
        )}

        {item.purchased && (
          <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
            ✅ Já comprado
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center gap-2 bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur">
        {item.url && (
          <Button asChild variant="outline" size="lg" className="flex-1 rounded-full">
            <a href={item.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Ver oferta
            </a>
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1 rounded-full"
          onClick={() => toggleItemPurchased(listId, item.id)}
        >
          <Check className="h-4 w-4" />
          {item.purchased ? "Marcar pendente" : "Marcar comprado"}
        </Button>
      </div>
    </div>
  );
}
