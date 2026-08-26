import { motion } from "motion/react";
import { ImageIcon } from "lucide-react";
import type { Item } from "@/lib/wishlist-store";

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
        <div className="flex h-full w-full items-center justify-center bg-muted">
          {item.emoji ? (
            <span className={emojiSize}>{item.emoji}</span>
          ) : (
            <ImageIcon className="h-1/4 w-1/4 text-muted-foreground/40" strokeWidth={1.25} />
          )}
        </div>
      )}
    </motion.div>
  );
}
