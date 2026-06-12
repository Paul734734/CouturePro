# couture-pro

Vite + React + TypeScript starter with TailwindCSS and example integrations.

Commands

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Notes

- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`.
- Example components are in `src/components` and `src/pages`.

## Déploiement (GitHub Pages)

1. Build production :
   ```bash
   npm run build
   ```

2. GitHub Pages : choisir la source **GitHub Actions** (recommandé) ou **/docs**.
   - Ici, le projet est configuré pour GitHub Pages avec :
     `base: '/CouturePro/'` dans `vite.config.ts` (nom du repo = `CouturePro`).

3. SPA (React Router) : GitHub Pages ne gère pas toujours le fallback automatiquement.
   - Le plus simple est d’utiliser un workflow GitHub Actions avec un `404.html`/rewrite.
   - (Si besoin, je peux ajouter le workflow GitHub Actions complet.)

