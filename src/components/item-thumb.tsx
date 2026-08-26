import type { Item } from "@/lib/wishlist-store";
import { placeholderGradient } from "@/lib/placeholder";

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
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-border ${dim}`}
      style={item.imageUrl ? undefined : placeholderGradient(item.id)}
    >
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-3xl opacity-70">
          🎁
        </span>
      )}
      {item.purchased && (
        <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
          comprado
        </span>
      )}
    </button>
  );
}
