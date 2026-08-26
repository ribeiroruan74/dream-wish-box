import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Item = {
  id: string;
  name: string;
  price: number | undefined;
  purchased: boolean;
};

export type WishlistList = {
  id: string;
  name: string;
  emoji: string;
  shared: boolean;
  pinned: boolean;
  createdAt: number;
  items: Item[];
};

const STORAGE_KEY = "wishlist-lists";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seedLists(): WishlistList[] {
  const now = Date.now();
  const day = 86_400_000;
  const make = (
    name: string,
    emoji: string,
    ageDays: number,
    shared: boolean,
    pinned: boolean,
    items: [string, number | undefined, boolean][],
  ): WishlistList => ({
    id: uid(),
    name,
    emoji,
    shared,
    pinned,
    createdAt: now - ageDays * day,
    items: items.map(([itemName, price, purchased]) => ({
      id: uid(),
      name: itemName,
      price,
      purchased,
    })),
  });

  return [
    make("Tecnologia", "💻", 2, true, true, [
      ["Fone Bluetooth", 349.9, false],
      ["Teclado mecânico", 459, false],
      ["Monitor 4K", 1899, false],
      ["Mouse sem fio", 129.9, true],
      ["SSD externo", 399, false],
      ["Carregador rápido", 89.9, true],
    ]),
    make("Viagens", "✈️", 5, true, false, [
      ["Mala de bordo", 599, false],
      ["Fone com cancelamento de ruído", 899, false],
      ["Trava de mala", 39.9, true],
    ]),
    make("Casa", "🛋️", 1, false, true, [
      ["Aspirador robô", 1299, false],
      ["Air fryer", 449, false],
      ["Jogo de panelas", 599, true],
      ["Luminária de mesa", 149, true],
      ["Tapete sala", 329, false],
      ["Cortina blackout", 219, false],
      ["Espelho decorativo", 259, true],
      ["Organizador de armário", 89, false],
    ]),
    make("Livros", "📚", 8, false, false, [
      ["O Hobbit", 44.9, true],
      ["Sapiens", 59.9, false],
      ["Hábitos Atômicos", 39.9, true],
      ["Duna", 69.9, false],
      ["O Poder do Agora", 34.9, true],
      ["A Sutil Arte de Ligar o F*da-se", 42.9, false],
      ["1984", 32.9, true],
      ["Mindset", 45.9, false],
    ]),
    make("Moda", "👟", 4, false, false, [
      ["Tênis branco", 399, false],
      ["Jaqueta jeans", 259, false],
      ["Óculos de sol", 189, true],
      ["Relógio", 599, false],
      ["Mochila", 219, false],
    ]),
    make("Games", "🎮", 3, true, false, [
      ["Controle extra", 349, false],
      ["Headset gamer", 449, true],
    ]),
  ];
}

type WishlistContextValue = {
  lists: WishlistList[];
  hydrated: boolean;
  getList: (id: string) => WishlistList | undefined;
  addList: (name: string, emoji: string) => WishlistList;
  removeList: (id: string) => void;
  toggleShared: (id: string) => void;
  togglePinned: (id: string) => void;
  addItem: (listId: string, name: string, price?: number) => void;
  toggleItemPurchased: (listId: string, itemId: string) => void;
  removeItem: (listId: string, itemId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<WishlistList[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setLists(JSON.parse(raw) as WishlistList[]);
      } catch {
        setLists(seedLists());
      }
    } else {
      setLists(seedLists());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists, hydrated]);

  const getList = (id: string) => lists.find((l) => l.id === id);

  const addList = (name: string, emoji: string) => {
    const next: WishlistList = {
      id: uid(),
      name,
      emoji: emoji || "📁",
      shared: false,
      pinned: false,
      createdAt: Date.now(),
      items: [],
    };
    setLists((current) => [next, ...current]);
    return next;
  };

  const removeList = (id: string) => setLists((current) => current.filter((l) => l.id !== id));

  const toggleShared = (id: string) =>
    setLists((current) => current.map((l) => (l.id === id ? { ...l, shared: !l.shared } : l)));

  const togglePinned = (id: string) =>
    setLists((current) => current.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));

  const addItem = (listId: string, name: string, price?: number) =>
    setLists((current) =>
      current.map((l) =>
        l.id === listId
          ? { ...l, items: [{ id: uid(), name, price, purchased: false }, ...l.items] }
          : l,
      ),
    );

  const toggleItemPurchased = (listId: string, itemId: string) =>
    setLists((current) =>
      current.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) => (i.id === itemId ? { ...i, purchased: !i.purchased } : i)),
            }
          : l,
      ),
    );

  const removeItem = (listId: string, itemId: string) =>
    setLists((current) =>
      current.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l,
      ),
    );

  return (
    <WishlistContext.Provider
      value={{
        lists,
        hydrated,
        getList,
        addList,
        removeList,
        toggleShared,
        togglePinned,
        addItem,
        toggleItemPurchased,
        removeItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
