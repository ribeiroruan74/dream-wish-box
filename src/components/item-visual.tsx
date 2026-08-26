import { motion } from "motion/react";
import { ImageIcon } from "lucide-react";
import type { Item } from "@/lib/wishlist-store";
import { placeholderGradient } from "@/lib/placeholder";

export function ItemVisual({
  item,
  emojiSize = "text-4xl",
  layoutId,
  className = "",
}: {
  item: Item;
  emojiSize?: string;
  layoutId?: string;
  className?: string;
}) {
  return (
    <motion.div
      layout={Boolean(layoutId)}
      {...(layoutId ? { layoutId } : {})}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className={`overflow-hidden ${className}`}
    >
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
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
      )}
    </motion.div>
  );
}
