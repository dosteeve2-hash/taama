@AGENTS.md
# TAAMA — Guide de développement

## Contexte produit
TAAMA (Mooré : "la voie, le chemin") est un SaaS industriel pour les PME de transformation du Burkina Faso.
Produit phare de FORGE Afrika — la vision de Steve de contrôler la chaîne de valeur africaine.

## Stack technique
- Next.js 16 App Router (TypeScript strict)
- Supabase SSR (@supabase/ssr)
- Tailwind CSS v4 + shadcn/ui
- Recharts (graphiques — toujours "use client")

## Architecture
- `src/app/(auth)/` — pages publiques (connexion, inscription)
- `src/app/(dashboard)/` — pages protégées (dashboard, production, inventaire, catalogue, rapports, traçabilité, paramètres)
- `src/lib/` — supabase clients, queries, alerts
- `src/types/database.ts` — types TypeScript générés depuis Supabase
- `src/components/` — composants par module (production/, inventaire/, catalogue/)
- `supabase/migrations/` — migrations SQL à appliquer via `supabase db push` ou MCP

## Règles de sécurité (OBLIGATOIRES)
1. Toujours `getUser()` jamais `getSession()` dans les Server Components/Actions
2. RLS activé sur toutes les tables — ne jamais utiliser la service_role key côté client
3. Isolation multi-tenant via `get_my_org_id()` dans tous les RLS policies
4. Variables .env.local : ne JAMAIS committer. Toujours BOM strip : `.replace(/^﻿/, '')`
5. `npm run build` avant tout push — 0 erreur obligatoire

## Pattern Server Actions
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function maAction(param: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  // ... logique métier
  revalidatePath('/dashboard/...')
}
```

## Design system
Palette TAAMA dans globals.css : amber (#f0a832), terra (#c4572a), bg charcoal (#0d1117)
Tous les composants utilisent les CSS variables — jamais de couleurs hardcodées.

## Base de données
11 tables avec RLS : organizations, sites, user_profiles, materials, suppliers, inventory, inventory_movements, batches, batch_inputs, batch_outputs, alerts
Migration : `supabase/migrations/001_initial_schema.sql`
Projet Supabase : horretcydcuqywtetqtx (eu-central-1)

## Commandes utiles
- `npm run dev` — dev local
- `npm run build` — vérification TypeScript + build
- `npm run lint` — ESLint

## Conformité EUDR
Effective décembre 2026. Les lots doivent avoir : inputs tracés + lot_code + quality_grade.
La page /tracabilite gère la conformité.
