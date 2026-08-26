import { useState, type FormEvent, type ReactNode } from "react";
import { useWishlist } from "@/lib/wishlist-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddItemDialog({ listId, trigger }: { listId: string; trigger: ReactNode }) {
  const { addItem } = useWishlist();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState("");

  const reset = () => {
    setName("");
    setPrice("");
    setImageUrl("");
    setUrl("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = price.trim() ? Number(price.replace(",", ".")) : undefined;
    addItem(listId, {
      name: name.trim(),
      price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      imageUrl: imageUrl.trim() || undefined,
      url: url.trim() || undefined,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo desejo</DialogTitle>
          <DialogDescription>Adicione um item a essa lista.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Nome</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: AirPods Max"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">Preço (opcional)</Label>
            <Input
              id="item-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="R$"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-image">Link da foto (opcional)</Label>
            <Input
              id="item-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-url">Link da loja (opcional)</Label>
            <Input
              id="item-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
