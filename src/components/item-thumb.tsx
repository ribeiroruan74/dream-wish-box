import type { Item } from "@/lib/wishlist-store";
import { ItemVisual } from "@/components/item-visual";

export function ItemThumb({
  item,
  onClick,
  size = "md",
}: {
  item: Item;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-28 w-28" : "h-full w-full";
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 transition-transform duration-200 ease-out active:scale-95"
    >
      <ItemVisual
        item={item}
        emojiSize="text-3xl"
        layoutId={`item-visual-${item.id}`}
        className={`rounded-2xl border border-border ${dim}`}
      />
      {item.purchased && (
        <span className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-primary/90 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
          comprado
        </span>
      )}
    </button>
  );
}
