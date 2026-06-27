<div align="center">

# 🏭 TAAMA

### *La voie vers l'industrie africaine intelligente*
### *The path to intelligent African industry*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F0A832?style=for-the-badge)](./LICENSE)
[![Made in Burkina Faso](https://img.shields.io/badge/Made%20in-Burkina%20Faso%20🇧🇫-C4572A?style=for-the-badge)](https://forge-afrika.com)

**TAAMA** (Mooré : *"la voie, le chemin"*) est un SaaS industriel conçu pour les PME de transformation du Burkina Faso et de l'Afrique de l'Ouest. Un ERP léger, moderne, pensé pour les réalités africaines.

</div>

---

## 🔥 Le problème

**63% des PME industrielles africaines gèrent leur production avec des cahiers, des tableurs Excel non partagés, ou de mémoire.**

Résultat :
- Pertes de matières premières non détectées
- Impossible de retracer l'origine d'un lot pour les exportations
- Alertes de stock trop tard (ruptures = arrêts de production)
- Aucune visibilité sur le rendement réel

**TAAMA change ça.**

---

## ✨ Fonctionnalités

### 🔐 Authentification multi-tenant
Onboarding guidé en 3 étapes : création d'organisation → ajout de site → profil utilisateur. Chaque entreprise est isolée avec RLS Supabase.

### 🏭 Module Production
- Création et suivi de lots de fabrication
- Saisie des intrants et extrants avec traçabilité complète
- Calcul automatique du rendement (rendement = sorties / entrées × 100)
- Historique complet par site de production

### 📦 Inventaire temps réel
- Suivi des niveaux de stock par matière et par site
- Alertes automatiques quand le stock passe sous le seuil minimum
- Mouvements d'inventaire horodatés et tracés
- Dashboard avec indicateurs visuels (critique / attention / ok)

### 📋 Catalogue matières & fournisseurs
- Base de données des matières premières avec unités et prix
- Gestion des fournisseurs avec coordonnées
- Association matière ↔ fournisseur

### 📊 Rapports & Analytics
- Tableaux de bord avec graphiques Recharts
- Export CSV des données de production et d'inventaire
- Rendements par lot, par période, par site
- KPIs industriels en temps réel

### 🌍 Traçabilité EUDR
- Conformité au règlement européen (effectif décembre 2026)
- Chaque lot possède : code unique, grade qualité, intrants tracés
- Page dédiée `/tracabilite` avec statut de conformité
- Prêt pour les exportations vers l'UE

### ⚙️ Paramètres multi-sites
- Gestion de plusieurs sites de production
- Profils utilisateurs par organisation
- Configuration des seuils d'alerte par matière

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) App Router + TypeScript strict |
| **UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Backend** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| **Graphiques** | [Recharts](https://recharts.org/) |
| **Auth** | Supabase SSR (`@supabase/ssr`) |
| **Déploiement** | [Vercel](https://vercel.com/) |

---

## 🚀 Installation locale

### Prérequis
- Node.js 18+
- Un projet Supabase (gratuit sur [supabase.com](https://supabase.com))
- Git

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/docompaore2/taama.git
cd taama

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
```

Renseigner dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

```bash
# 4. Appliquer les migrations Supabase
# Via Supabase CLI :
supabase db push

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗄️ Architecture base de données

11 tables avec Row Level Security (RLS) multi-tenant :

```
organizations       → Entreprises clientes
sites               → Sites de production par org
user_profiles       → Profils utilisateurs
materials           → Catalogue matières premières
suppliers           → Fournisseurs
inventory           → Niveaux de stock actuels
inventory_movements → Historique des mouvements
batches             → Lots de production
batch_inputs        → Intrants par lot
batch_outputs       → Extrants par lot
alerts              → Alertes seuil de stock
```

Toutes les tables sont isolées par `get_my_org_id()` — aucune donnée ne fuite entre organisations.

---

## 📅 Roadmap

### ✅ Phase 1 — Fondations (DONE)
- [x] Auth multi-étapes + multi-tenant
- [x] Module Production complet
- [x] Inventaire temps réel + alertes
- [x] Catalogue matières & fournisseurs
- [x] Rapports avec export CSV
- [x] Traçabilité EUDR
- [x] Paramètres multi-sites
- [x] Sidebar responsive mobile

### 🔧 Phase 2 — Collaboration (Q3 2026)
- [ ] Rôles et permissions (admin, opérateur, auditeur)
- [ ] Notifications email/SMS pour les alertes critiques
- [ ] Module achat (bons de commande fournisseurs)
- [ ] API publique REST pour intégrations tierces

### 🚀 Phase 3 — Intelligence (Q4 2026)
- [ ] Prévisions de stock par IA
- [ ] Application mobile (React Native)
- [ ] Intégration comptabilité (Sage, Wave)
- [ ] Tableau de bord EUDR automatisé pour exportateurs

---

## 🔒 Sécurité

- **RLS Supabase** activé sur toutes les tables — isolation multi-tenant garantie
- **`getUser()`** (jamais `getSession()`) dans tous les Server Components
- **Variables d'environnement** jamais committées (`.env*` dans `.gitignore`)
- **TypeScript strict** — 0 `any` en production

---

## 🤝 Contribuer

Les contributions sont bienvenues ! TAAMA est un projet open-source au service des entrepreneurs africains.

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/ma-feature`)
3. Commitez vos changements (`git commit -m 'feat: description'`)
4. Poussez (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT © 2026 [Steve Donald Compaoré](https://github.com/docompaore2)

---

<div align="center">

**Si ce projet vous inspire, laissez une ⭐ — ça compte beaucoup !**

*Fait avec ❤️ depuis Ouagadougou et Istanbul*

*Un projet [FORGE Afrika](https://forge-afrika.com) — contrôler la chaîne de valeur africaine*

</div>
