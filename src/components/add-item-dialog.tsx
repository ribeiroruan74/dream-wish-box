import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Search } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { fetchProductImage } from "@/lib/fetch-product-image";
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
  const [emoji, setEmoji] = useState("");
  const [url, setUrl] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPrice("");
    setImageUrl("");
    setEmoji("");
    setUrl("");
    setImageStatus(null);
  };

  const tryFetchImage = async (candidate: string) => {
    if (!candidate.trim() || imageUrl.trim() || fetchingImage) return;
    setFetchingImage(true);
    setImageStatus(null);
    try {
      const result = await fetchProductImage({ data: candidate.trim() });
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
        setImageStatus(null);
      } else {
        setImageStatus(result.error ?? "Não achei uma foto nessa página");
      }
    } catch {
      setImageStatus("Não consegui acessar esse link");
    } finally {
      setFetchingImage(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = price.trim() ? Number(price.replace(",", ".")) : undefined;
    addItem(listId, {
      name: name.trim(),
      price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      imageUrl: imageUrl.trim() || undefined,
      emoji: emoji.trim() || undefined,
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
            <Label htmlFor="item-url">Link da loja (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="item-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => tryFetchImage(url)}
                placeholder="https://..."
                type="url"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Buscar foto do produto"
                disabled={!url.trim() || fetchingImage}
                onClick={() => tryFetchImage(url)}
              >
                {fetchingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {fetchingImage
                ? "Buscando a foto do produto..."
                : imageUrl
                  ? "Foto encontrada ✓"
                  : (imageStatus ??
                    "A gente tenta pegar a foto do produto sozinho a partir do link.")}
            </p>
          </div>

          {imageUrl && (
            <div className="flex items-center gap-3">
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs font-medium text-muted-foreground underline"
              >
                Remover foto
              </button>
            </div>
          )}

          {!imageUrl && (
            <div className="space-y-2">
              <Label htmlFor="item-emoji">Emoji (opcional, se não tiver foto)</Label>
              <Input
                id="item-emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🎁"
                maxLength={2}
                className="w-20 text-center text-lg"
              />
            </div>
          )}

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

          <DialogFooter>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
