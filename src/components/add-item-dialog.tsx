import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Search } from "lucide-react";
import { useWishlist, type Item } from "@/lib/wishlist-store";
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

type Props = {
  listId: string;
  trigger?: ReactNode;
  editItem?: Item;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AddItemDialog({ listId, trigger, editItem, open, onOpenChange }: Props) {
  const { addItem, updateItem } = useWishlist();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [emoji, setEmoji] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState<string | null>(null);

  const reset = () => {
    setName(editItem?.name ?? "");
    setPrice(editItem?.price != null ? String(editItem.price) : "");
    setImageUrl(editItem?.imageUrl ?? "");
    setEmoji(editItem?.emoji ?? "");
    setUrl(editItem?.url ?? "");
    setNote(editItem?.note ?? "");
    setImageStatus(null);
  };

  // Re-fill the form whenever it opens, so a stale draft never leaks between items.
  useEffect(() => {
    if (isOpen) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editItem?.id]);

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
    const payload = {
      name: name.trim(),
      price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      imageUrl: imageUrl.trim() || undefined,
      emoji: emoji.trim() || undefined,
      url: url.trim() || undefined,
      note: note.trim() || undefined,
    };
    if (editItem) {
      updateItem(listId, editItem.id, payload);
    } else {
      addItem(listId, payload);
    }
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Editar desejo" : "Novo desejo"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Atualize as informações desse item." : "Adicione um item a essa lista."}
          </DialogDescription>
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
            <Button type="submit">{editItem ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
