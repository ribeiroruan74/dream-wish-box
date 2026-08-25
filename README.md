# Wishlist

Organize seus desejos em listas: presentes, viagens, tecnologia e mais.
Marque o que já comprou e acompanhe o que falta. Funciona como PWA — pode
ser instalado na tela inicial do celular.

## Stack

- [TanStack Start](https://tanstack.com/start) (React, com SSR) + [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- [Nitro](https://nitro.build) para o build do servidor

## Desenvolvimento

Requer Node.js (ou [Bun](https://bun.sh)).

```sh
npm i      # ou: bun install
npm run dev
```

O app sobe em `http://localhost:8080`.

## Build

```sh
npm run build
npm run preview
```

`npm run build` gera um bundle SSR via Nitro em `dist/`, que pode ser hospedado
em qualquer plataforma Node (Vercel, Netlify, Railway, um servidor próprio, etc.).
