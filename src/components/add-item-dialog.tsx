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
import { Textarea } from "@/components/ui/textarea";

export function AddItemDialog({ listId, trigger }: { listId: string; trigger: ReactNode }) {
  const { addItem } = useWishlist();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [emoji, setEmoji] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPrice("");
    setImageUrl("");
    setEmoji("");
    setUrl("");
    setNote("");
    setImageStatus(null);
  };

  const fetchImage = async (candidate: string) => {
    if (!candidate.trim() || fetchingImage) return;
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
      note: note.trim() || undefined,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
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
                onBlur={() => !imageUrl.trim() && fetchImage(url)}
                placeholder="https://..."
                type="url"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Buscar foto do produto"
                disabled={!url.trim() || fetchingImage}
                onClick={() => fetchImage(url)}
              >
                {fetchingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-image">Link da foto (opcional)</Label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              )}
              <Input
                id="item-image"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageStatus(null);
                }}
                placeholder="https://..."
                type="url"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {fetchingImage
                ? "Buscando a foto do produto..."
                : (imageStatus ??
                  "Tentamos achar a foto sozinhos a partir do link da loja — se vier errada, cole aqui a foto certa.")}
            </p>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="item-note">Nota (opcional)</Label>
            <Textarea
              id="item-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cor, tamanho, ou qualquer detalhe..."
              rows={2}
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
