# Réenchanter - Documentation Complète du Projet

## 1. Présentation du Projet

**Nom:** Réenchanter  
**Tagline:** "Le monde, ensemble 🌍✨"  
**Type:** Plateforme communautaire web  
**Stack:** Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Supabase, Three.js  
**Date de création:** 2026

### Objectif Principal

Réenchanter est une plateforme communautaire où chacun peut partager ses des actions d'après une liste, et contribuer à rendre le monde plus beau. Les utilisateurs soumettent des preuves de leurs bonnes actions, accumulent des points et grimpent un classement mondial basé sur des contributions authentiques.

### Valeurs Fondamentales

- **Bonne foi communautaire**: Le système repose sur l'honnêteté des utilisateurs
- **Authenticité**: Les fausses preuves n'ont pas leur place
- **Vérification**: Des vérifications régulières assurent la qualité des contributions
- **Inclusivité**: Accessible à tous, dans tous les pays

---

## 2. Architecture Globale

### Frontend

- **Framework:** Nuxt 3 (SSR ready)
- **Style:** Tailwind CSS + custom CSS scoped
- **Authentification:** Supabase Auth (Google OAuth + Email/Password)
- **Image optimization:** NuxtImg
- **3D Graphics:** Three.js pour scène interactive de la planète et des élémentes de décor (arc en ciel, nuages, soleil, etc..)

### Backend / Database

- **Service:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth avec Google OAuth
- **Storage:** Supabase Storage pour les preuves (photos/captures)
- **Middleware:** Auth & guest checks, submission rate limiting

### Design System

**Couleurs:**

- Primary: `#FF1493` (Hot Pink) - Headings, buttons, active states
- Secondary: `#FF69B4` (Light Pink) - Borders, accents, hovers
- Background: Quadrillage 60px (grid pattern)
- Text: Gray scale (#999, #666, #333)
- Success: `#22c55e` (Green)
- Error: `#ef4444` (Red)

**Fonts:**

- Headings: Font-black/bold
- Body: Font-normal
- Inputs: Sans-serif system fonts

---

## 3. Structure des Pages

### 3.1 `/` (Homepage / Index)

améliorer - Composant 3D intégré  
**Description:** Page d'accueil du site avec présentation et scène 3D interactive  
**Contenu:**

- Navigation header
- Hero section avec texte d'accueil
- **Composant PlanetScene (Three.js)** - Scène 3D interactive
  - Planète 3D rotative
  - Éclairage dynamique
  - Contrôles souris (drag, zoom)
  - Responsive et optimisé
- Features overview
- Call-to-action vers login/signup
- Footer: CACHÉ (ne s'affiche pas)

**Détails:**

- Pas d'authentification requise
- Accessible aux guests
- Fond quadrillé standard
- Scène Three.js sur toute la section hero
- Fond quadrillé standard

---

### 3.2 `/login` (Connexion/Inscription)

**Status:** ✅ AVANCÉ - Stylisé et animé  
**Middleware:** `guest` (redirige les utilisateurs connectés vers dashboard)

#### Fonctionnalités:

1. **Authentification Google OAuth**
   - Redirect vers `/confirm` après succès
   - Bouton avec logo Google intégré
2. **Email/Password Auth**
   - Sign In (connexion)
   - Sign Up (inscription)
   - Validation des champs
   - Messages d'erreur/succès

3. **Design & Animations:**
   - Fond quadrillé standard
   - Tabs pour basculer Sign In/Sign Up
   - Formulaire centré max-w-3xl
   - **Inputs améliorés:**
     - Padding horizontal responsif: `px-3 md:px-5 lg:px-8`
     - Focus state: fond gris + shadow rose semi-transparent
     - Classes: `focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]`
   - **Boutons:**
     - Centré en mobile ET desktop
     - Taille fixe desktop: `md:max-w-sm md:mx-auto`
     - Hover: `scale-105`
   - **Planète animée en arrière-plan:**
     - Position: fixed, bas de l'écran
     - Parallax scroll au défilement (30% movement limit)
     - Rotation 360° lente (150 secondes)
     - Z-index: `z-5` (sous formulaire, au-dessus du fond)
     - Desktop offset: `lg:right-[-30%]` pour décaler vers la droite
     - Emojis pédagogiques dans le texte descriptif

#### Composants utilisés:

- Supabase Client
- Vue refs pour state management
- Event listeners pour parallax

---

### 3.3 `/confirm` (Confirmation & Redirection)

**Status:** ✅ COMPLÈTE  
**Middleware:** Aucun (accessible à tous)

#### Fonctionnalités:

- Affiche un spinner animé
- Message: "Direction le Réenchantement du monde ! 😁"
- Auto-redirect vers `/dashboard` quand l'utilisateur est authentifié
- Fond quadrillé standard

#### Design:

- Spinner: 4px border rose avec animation
- Texte centré avec emoji
- Transition fluide vers dashboard

---

### 3.4 `/dashboard` (Tableau de Bord)

**Status:** ✅ TRÈS AVANCÉ - Animations complètes  
**Middleware:** `auth` (authentification requise)

#### Structure:

1. **Profile Card (UserProfileCard)**
   - Avatar utilisateur
   - Pseudo (clickable → user profile)
   - Email
   - Bouton "Profil" → `/user/[id]`
   - Bouton "Logout"

2. **Points Card**
   - Points totaux de l'utilisateur
   - Badge avec couleur rose

3. **Deed Management**
   - Section "Bonnes Actions À Soumettre"
     - Affiche les `user_deeds` en status "pending"
     - **DeedsInProgressCard** pour chaque:
       - Titre de la bonne action
       - Points associés
       - Bouton "Soumettre une preuve" → `/submit/[id]`
       - Status badge
   - Section "Bonnes Actions Validées"
     - Affiche les `user_deeds` en status "validated"
     - **ValidatedDeedCard** pour chaque:
       - Titre
       - Points gagnés
       - Date de validation
       - Image de preuve

4. **Search & Filter**
   - **DeedsSearchBar**: Input de recherche texte
     - Recherche par titre/description/date
     - Focus state: gris + shadow rose
     - Overflow-hidden pour éviter les coins blancs au scale
   - **Filter Component**: Filtrer par continent
     - Dropdown ou button group
     - Multi-select possible
     - Filter par status (pending/validated)

#### Animations:

- **Unified CSS animation system:**
  - Classe: `.fade-in-up`
  - Animation: `fadeInUp 0.5s ease-out forwards`
  - CSS Variable delay: `animation-delay: var(--delay, 0s)`
- **Delay Cascade (Progressive):**
  - Title: `--delay: 0s`
  - UserProfileCard: `--delay: 0.1s`
  - PointsCard: `--delay: 0.2s`
  - Section titles: `--delay: 0.3s`
  - DeedsInProgressCard: `--delay: 0.4s + (index × 0.1s)`
  - Search bar: `--delay: 0.9s`
  - Filter: `--delay: 1s`
  - ValidatedDeedCards: `--delay: 1.1s + (index × 0.1s)`

---

### 3.5 `/submit/[id]` (Soumission de Preuve)

**Status:** ✅ FONCTIONNEL - À améliorer visuellement  
**Middleware:** `auth`, `submit-limit` (rate limiting)

#### Formulaire:

1. **Pays** (Select) - Obligatoire
   - Liste complète de tous les pays
   - Focus state: gris + shadow rose
   - Classes: `focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]`

2. **Détails** (Textarea) - Optionnel
   - Message placeholder: "Raconte-nous plus sur ta bonne action..."
   - Resizable
   - Focus state: même styling que inputs
   - Classes: `focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]`

3. **Photo/Capture** (File Input) - Obligatoire
   - Drag & drop ou click pour sélectionner
   - Formats acceptés: JPG, PNG, WebP
   - Aperçu de l'image sélectionnée
   - Indicateur visuel de succès

4. **Message d'Ethique**
   - Fond `#FFE4F1` (rose très clair)
   - Texte explicatif sur l'authenticité required
   - Emojis pour engagement
   - Non-dismissible

#### Workflow de Soumission:

1. Upload de l'image vers Supabase Storage
2. Récupération URL publique
3. Auto-validation: Update user_deed avec status "validated"
4. Points automatiquement ajoutés
5. Modal de confirmation
6. Redirect vers dashboard (2s delay)

#### Composants:

- SubmissionModal (confirmation/erreur)
- File preview
- Validation form-level

---

### 3.6 `/gallery` (Galerie Globale)

**Status:** ✅ À vérifier  
**Description:** Affichage de toutes les bonnes actions validées

#### Composants:

- **GalleryCard**: Affiche chaque deed validée
  - Image de preuve en lightbox modal au click
  - Titre + points + date
  - Nom d'utilisateur (clickable → profil utilisateur)

---

### 3.7 `/actions` (Bonnes Actions Disponibles)

**Status:** ✅ À vérifier  
**Description:** Catalogue de toutes les bonnes actions disponibles à accomplir

#### Contenu:

- Liste des deeds avec descriptions
- Points associés
- Badges de difficulté/catégorie
- Call-to-action "Participer"

---

### 3.8 `/leaderboard` (Classement)

**Status:** ✅ À vérifier  
**Description:** Classement mondial des utilisateurs par points

#### Affichage:

- Top 10 / Top 50 / Tous
- Rang + Avatar + Pseudo + Points
- User actuel highlight
- Recherche de pseudo

---

### 3.9 `/user/[id]` (Profil Public)

**Status:** ✅ FONCTIONNEL  
**Middleware:** Aucun (public)

#### Affichage:

- Avatar utilisateur
- Pseudo
- Points totaux
- Nombre de deeds validées
- Galerie de preuves validées (ContinentOverlay avec images)
- Bouton retour: `router.back()` (navigation dynamique)

#### Composants:

- **ContinentOverlay** (réutilisé):
  - Affiche les deeds validées groupées par continent
  - Usernames clickables → profil utilisateur
  - Lightbox modal au click sur image
  - Points badge affichés
  - Card headers réorganisés: [avatar+name] [points] [title-below]

---

## 4. Composants Réutilisables

### MyHeader

- Navigation principale
- Logo clickable → homepage
- Links: Actions, Dashboard, Gallery, Leaderboard
- Authentication status
- Mobile responsive

### MyFooter

**Status:** ✅ COMPLÈTE ET ANIMÉE  
**Apparition:** Visible sur TOUTES les pages SAUF homepage (`/`)

#### Structure (3 colonnes responsive):

1. **Logo Section** (fade-in-up 0s)
   - Logo avec NuxtLink vers homepage
   - Hover opacity effect

2. **À Propos** (fade-in-up 0.1s)
   - Description du projet
   - Tagline "Ensemble, réenchantons le monde 🌍✨"

3. **Navigation** (fade-in-up 0.2s)
   - Links: Bonnes actions, Dashboard, Galerie, Classement
   - Hover color change

4. **Nous Contacter** (fade-in-up 0.3s)
   - Email link
   - Social media section:
     - **Icons:** X (Twitter), Instagram, TikTok
     - Format: Circular pink buttons (40px)
     - SVG inline avec `fill="currentColor"`
     - Hover: `scale-110`
     - Tous officiels et reconnaissables

5. **Footer Bottom** (fade-in-up 0.4s & 0.5s)
   - Copyright notice
   - Links: Mentions légales, Politique de confidentialité, Conditions

#### Design:

- Border-top: 2px `#FF69B4`
- Background: `rgba(255, 255, 255, 0.95)`
- Responsive: 1 col mobile, 3 cols desktop
- Padding: `px-4 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20`
- Z-index: `relative z-[1000]` (au-dessus de la planète)
- Animations: Cascade fade-in-up

### DeedsSearchBar

**Status:** ✅ COMPLÈTE - Opimisée pour les coins  
**Fonctionnalité:** Recherche texte sur deeds

#### Features:

### PlanetScene

**Status:** ✅ INTÉGRÉE - Scène 3D interactive  
**Utilisée:** Page d'accueil (`/`)
**Framework:** Three.js

#### Fonctionnalités:

1. **Rendu 3D**
   - Scène Three.js avec WebGL renderer
   - Planète 3D (geometry + material)
   - Lumières: Directional light + ambient light
   - Texture mappage (optionnel)

2. **Interactions**
   - Contrôle souris:
     - Drag pour rotation
     - Scroll pour zoom
     - Double-click pour reset
   - Orbit controls (optionnel)
   - Responsive: adapte size au viewport

3. **Optimisations**
   - Clipping planes pour performance
   - Pixel ratio management
   - Destroy/cleanup on unmount
   - Animation frame cleanup

4. **Intégration Vue**
   - Component mounted: Initialise scene
   - Window resize listener
   - Props: width, height (optionnels)
   - Émits events: interaction states

#### Code Pattern:

```typescript
// Initialization
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(...)
const renderer = new THREE.WebGLRenderer({ antialias: true })

// Geometry
const geometry = new THREE.SphereGeometry(radius, segments, rings)
const material = new THREE.MeshPhongMaterial(...)
const planet = new THREE.Mesh(geometry, material)

// Lighting
const light = new THREE.DirectionalLight(...)
scene.add(light)

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  planet.rotation.y += 0.001 // Slow rotation
  renderer.render(scene, camera)
}

// Cleanup
onUnmounted(() => {
  geometry.dispose()
  material.dispose()
  renderer.dispose()
  window.removeEventListener('resize', onWindowResize)
})
```

#### Ressources Utilisées:

- `/public/models/` - Modèles 3D (si textures nécessaires)
- Textures UV mapping pour la planète
- Fichiers `.gltf` ou `.obj` optionnels

### DeedsSearchBar

- Input avec icon de recherche
- Placeholder dynamique
- Focus state: gris + shadow rose
- Container: `overflow-hidden rounded-xl` (évite coins blancs au scale)
- Hover shadow expansion
- Classes v-model binding pour reactivity

### UserProfileCard

- Avatar + pseudo + email
- Boutons actions (Profil, Logout)

### PointsCard

- Points badge
- Styling distinctif

### DeedsInProgressCard

- Titre deed
- Points
- Bouton soumettre
- Status badge
- Animation fade-in-up avec delay variable

### ValidatedDeedCard

- Titre
- Points gagnés + date
- Image preuve
- Animation fade-in-up avec delay variable

### ContinentOverlay

**Status:** ✅ AVANCÉ  
**Réutilisé:** Gallery, User profile page

#### Features:

- Modal fullscreen avec continental organization
- Groupage par continent
- **Card Layout:**
  - Header réorganisé: [avatar+nom utilisateur à gauche] [points badge à droite] [titre en-dessous]
  - Username: Clickable NuxtLink → user profile (`/user/[id]`)
  - Evidence image: "Voir la preuve 🖼️" → Lightbox modal
  - Points displayed prominently
  - Responsive grid

- **Lightbox Modal:**
  - Teleport to body
  - Fixed inset-0, bg-black/75
  - Close button (✕) top-right
  - Identical to GalleryCard implementation
  - Image display centered
  - Click anywhere outside = close

### SubmissionModal

- Success/Error display
- Auto-close or manual close
- Redirect handling

### FilterComponent

- Filter by continent
- Multi-select capability
- Filter by status

---

## 5. Styles Récurrents du Site

### Couleurs

```
Primary: #FF1493 (Hot Pink)
Secondary: #FF69B4 (Light Pink)
Background Grid: rgba(180, 180, 180, 0.2) - 60px spacing
White overlays: rgba(255, 255, 255, 0.9) ou rgba(255, 255, 255, 0.95)
Pink overlay: #FFE4F1 (très clair)
Success: #22c55e
Error: #ef4444
Text Dark: #333
Text Gray: #666, #999
```

### Cards

```
Classe: border-2 rounded-2xl
Border color: #FF69B4
Background: rgba(255, 255, 255, 0.9) ou rgba(255, 255, 255, 0.95)
Padding: p-5 md:p-8 lg:p-10
```

### Inputs & Textareas

````
Classes de base:
  w-full px-3 md:px-5 lg:px-8 py-3
  border-2 rounded-lg
  outline-none transition-all duration-300
  text-base

Border color: #FF69B4
Configuration Three.js & Scène 3D

### Dépendances

```json
{
  "three": "^r128+",
  "three/examples/jsm/controls/OrbitControls": "optional"
}
````

### Architecture Scène

```
Scene (THREE.Scene)
├── Camera (THREE.PerspectiveCamera)
│   └── Aspect ratio: window.innerWidth / window.innerHeight
├── Renderer (THREE.WebGLRenderer)
│   └── antialias: true
│   └── alpha: true (transparent background)
├── Planet (THREE.Mesh)
│   ├── Geometry: SphereGeometry(50, 32, 32)
│   └── Material: MeshPhongMaterial
├── Lights
│   ├── DirectionalLight (sun)
│   ├── AmbientLight (fill light)
│   └── PointLight (optionnel)
└── Controls (optionnel)
    └── OrbitControls pour interactions souris
```

### Performance Considérations

- **Résolution:** Adapter segments/rings selon device
- **Textures:** Utiliser compressed formats (WebP, ASTC)
- **Fog:** Ajouter pour profondeur et performance
- **LOD:** Level of Detail pour modèles complexes
- **Viewport:** Clipping near/far planes optimisés

### Browser Support

- WebGL 1.0+ requis
- Performance stable sur:
  - Desktop: Excellente
  - Tablet: Bonne (légère réduction detail)
  - Mobile: Acceptable (low-poly geometry)

---

## 7.

Focus state:
focus:bg-gray-100
focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]

Applications:

- Email/Password inputs (login.vue)
- Select country (submit page)
- Textarea details (submit page)
- Search bar (DeedsSearchBar)

```

### Buttons

```

Primary Button:
px-6 py-3 rounded-lg font-bold text-white
background: #FF1493
hover:scale-105
transition-all duration-300
disabled:opacity-50 disabled:cursor-not-allowed

Secondary Button (outline):
px-6 py-3 rounded-lg font-bold
border-2 border-#FF69B4
color: #FF1493
background: rgba(255, 105, 180, 0.05)
hover:scale-105
transition-all duration-300

```

### Headings

```

h1: text-5xl md:text-6xl font-black color:#FF1493
h2: text-3xl md:text-4xl font-black color:#FF1493
h3: text-xl md:text-2xl font-black color:#FF1493
h4: text-lg md:text-xl font-bold color:#D9187F (darker pink)

```

### Animations Globales

```

Keyframe: fadeInUp
from: opacity 0, translateY(20px)
to: opacity 1, translateY(0)
duration: 0.5s ease-out forwards

Application: .fade-in-up class
avec CSS variable: animation-delay: var(--delay, 0s)

Utilisé sur: Dashboard elements, Footer content

```

### Spacing Standard

```

Mobile: px-4, gap-4
Tablet: px-8, gap-6
Desktop: px-12, gap-8

Responsive padding: px-4 md:px-8 lg:px-12
Responsive text: text-sm md:text-base lg:text-lg

```

### Responsive Design

```

Mobile-first approach
Breakpoints (Tailwind):
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

Utilisés principalement: md: et lg:

```

---

## 6. Structure Base de Données (Supabase)

### Tables Principales

#### `users`

```

- id (uuid, PK)
- email (string, unique)
- created_at (timestamp)
- profile_picture (url, nullable)
- bio (text, nullable)
- total_points (integer, default 0)

```

#### `good_deeds`

```

- id (uuid, PK)
- title (string)
- description (text)
- points (integer)
- category (string) - ex: "environment", "health", "education"
- difficulty (string) - ex: "easy", "medium", "hard"
- created_at (timestamp)

```

#### `user_deeds`

```

- id (uuid, PK)
- user_id (uuid, FK → users)
- good_deed_id (uuid, FK → good_deeds)
- status (enum: pending, validated, rejected)
- submission_text (text, nullable)
- country (string)
- evidence_url (url, nullable) - Supabase Storage URL
- submitted_at (timestamp, nullable)
- validated_at (timestamp, nullable)
- validation_method (string) - "auto" ou "manual"
- points_awarded (integer, default 0)
- created_at (timestamp)

```

#### `continents`

```

- id (uuid, PK)
- name (string)
- image_url (url)

```

#### `deed_continents` (Junction table)

```

- deed_id (uuid, FK → good_deeds)
- continent_id (uuid, FK → continents)

```

### Storage Buckets

```

- evidence (public): user_id/userDeedId.ext
  Accès: Public URLs générées

```

---

## 7. Fonctionnalités de Sécurité & Validation

### Middlewares

```

auth.ts: Redirige vers /login si non authentifié
guest.ts: Redirige vers /dashboard si authentifié
submit-limit.ts: Rate limiting sur /submit

```

### Validations

```

Email: Format validation + existence check
Password: Min length check
Country: Non-null validation
File: Type check (image only)
Submission text: Optional

```

### Authentification

```

Provider: Supabase Auth
Methods:

- Google OAuth (redirect to /confirm)
- Email/Password (native)
  Redirect URL: ${origin}/confirm
  Session: Auto-managed par Supabase

```

---

## 8. État d'Avancement du Projet

### Pages Complètes ✅

- `/login` - Authentification avec animations
- `/confirm` - Confirmation et redirect
- `/dashboard` - Dashboard avec animations complètes
- `/submit/[id]` - Soumission de preuves
- `/footer` - Footer complet avec animations

### Pages Fonctionnelles ✅

- `/gallery` - Galerie avec lightbox
- `/user/[id]` - Profil public
- `/actions` - Actions disponibles
- `/leaderboard` - Classement

### Composants Complets ✅

- MyHeader - Navigation
- MyFooter - Footer avec socials officiels
- DeedsSearchBar - Recherche optimisée
- ContinentOverlay - Lightbox et groupage continental
- UserProfileCard - Profil utilisateur
- ValidatedDeedCard - Cartes validées
- DeedsInProgressCard - Cartes en cours
- SubmissionModal - Modal de confirmation

### Fonctionnalités Complètes ✅

- Authentification Google OAuth
- Authentification Email/Password
- Soumission et auto-validation de preuves
- Recherche et filtrage des deeds
- Affichage de profils utilisateurs
- Lightbox modal pour images
- Animations cascade au chargement
- Parallax scroll de la planète
- Rotation 360° de la planète
- Focus states uniformes sur inputs
- Footer responsive avec socials

### À Améliorer / En Cours 🔄

- Optimisation des performances
- Mobile testing complet
- Pagination sur gallery/leaderboard
- Pagination sur dashboard
- Améliorer visuellement le formulaire submit
- Tests d'authentification complets

### À Implémenter 📋

- Modération et vérification manuelle
- Notifications utilisateur
- Direct messaging entre utilisateurs
- Système de "likes" sur deeds
- Achievements/badges
- Seasonal challenges
- Admin panel
- Analytics dashboard
- Email notifications
- Two-factor authentication

---

## 9. Guidelines pour IA

### Conventions de Nommage

```

Components: PascalCase (MyHeader.vue, UserProfileCard.vue)
Files: kebab-case (search-bar.vue)
Variables: camelCase (userId, submissionText)
CSS Classes: kebab-case + Tailwind (class="flex gap-4")
Constants: UPPER_CASE

```

### Structure de Fichier

```

/pages - Routes Nuxt
/components - Composants réutilisables
/layouts - Layouts (default.vue)
/middleware - Auth & custom middleware
/utils - Utilitaires
/types - TypeScript types
/composables - Vue composables
/public/images - Images statiques
/public/models - 3D models

```

### Code Style

```

- Préférer Tailwind CSS pour styling
- Utiliser CSS scoped pour styles spécifiques
- Vue 3 Composition API avec setup()
- TypeScript strict mode
- Comments explicatifs sur logique complexe

```

### Colors Palette (Réutilisation)

```

Primaire: toujours #FF1493 pour emphasis
Secondaire: toujours #FF69B4 pour borders/accents
Hover states: toujours text-[#FF1493] ou bg-[#FF1493]
Focus states: toujours shadow-[0_0_0_3px_rgba(255,105,180,0.2)]
Backgrounds: toujours rgba(255, 255, 255, 0.9) ou 0.95

```

### Animation Guidelines

```

Durée standard: 0.3s pour transitions, 0.5s pour entrées
Timing: ease-out pour entrées, ease-in-out pour transitions
Delays: Variables CSS pour cascades
Hover effects: hover:scale-105, hover:shadow-xl
Parallax: utiliser window.scrollY \* coefficient

```

### Responsive Guidelines

```

Approche: Mobile-first
Breakpoints clés: md:, lg:
Padding: px-4 md:px-8 lg:px-12
Text: text-sm md:text-base lg:text-lg
Flex direction: flex-col md:flex-row
Display: block md:grid

```

### Validation Input

```

Types: email, password, text, select, textarea, file
Required: Marquer avec span class="text-red-500"
Error messages: Toast ou modal avec isSuccess boolean
Focus states: Toujours gris + shadow rose
Disabled state: opacity-50 cursor-not-allowed

```

---

## 10. Ressources & Assets

### Images

- `/public/images/réenchanter.png` - Logo de la planète (animée, parallax)

### Models 3D

- `/public/models/` - (À utiliser pour amélioration future)

### Fonts

- System fonts (Tailwind default)
- Weights: normal, semibold, bold, black

---

## Conclusion

Réenchanter est un projet de plateforme communautaire bien structuré avec une architecture claire, un design système cohérent et une excellente expérience utilisateur grâce aux animations et interactions fluides. Le projet est fonctionnel et prêt pour les améliorations futures et la modération.

**Dernière mise à jour:** 4 Février 2026
```
