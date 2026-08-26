import { ImageIcon } from "lucide-react";
import type { Item } from "@/lib/wishlist-store";
import { placeholderGradient } from "@/lib/placeholder";

export function ItemVisual({ item, emojiSize = "text-4xl" }: { item: Item; emojiSize?: string }) {
  if (item.imageUrl) {
    return <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={placeholderGradient(item.id)}
    >
      {item.emoji ? (
        <span className={emojiSize}>{item.emoji}</span>
      ) : (
        <ImageIcon className="h-1/3 w-1/3 text-foreground/25" strokeWidth={1.5} />
      )}
    </div>
  );
}
