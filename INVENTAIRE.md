# Inventaire des dépendances Base44

Généré le 2026-08-17. Portée : tout le code source (`src/`) et la configuration
Base44 (`base44/`) du dépôt `arbre-d-cisionnel-eda`.

## 0. Résumé

L'application est **fortement couplée à Base44** : il n'existe qu'un seul point
d'entrée SDK (`src/api/base44Client.js`), mais il est importé dans **51 fichiers**
sur ~200. Base44 fournit ici quatre choses distinctes qu'il faudra remplacer
séparément :

1. **Base de données / ORM** — 13 entités CRUD (`base44.entities.*`)
2. **Authentification & comptes** — email/mot de passe, sessions, invitations,
   rôles (`base44.auth.*`, `base44.users.*`)
3. **Intégrations IA/fichiers** — upload de fichiers et appels LLM
   (`base44.integrations.Core.*`)
4. **Plateforme d'hébergement/build** — fonctions serveur Deno, plugin Vite,
   OAuth pour clients MCP (agents IA), appels REST directs à l'API Base44

Aucune clé/secret n'est en dur dans le code ni dans l'historique Git (voir
section 8).

---

## 1. Client SDK central

| Fichier | Rôle |
|---|---|
| [src/api/base44Client.js](src/api/base44Client.js) | Crée le client `base44` (`createClient` de `@base44/sdk`) à partir de `appId`, `token`, `functionsVersion`, `appBaseUrl`. **Tous** les autres fichiers passent par cet unique client. |
| [src/lib/app-params.js](src/lib/app-params.js) | Résout ces paramètres depuis l'URL, le `localStorage`, ou les variables d'env Vite (`VITE_BASE44_APP_ID`, `VITE_BASE44_FUNCTIONS_VERSION`, `VITE_BASE44_APP_BASE_URL`). Gère aussi le nettoyage du token dans l'URL. |
| [vite.config.js](vite.config.js) | Plugin `@base44/vite-plugin` : réécrit les imports legacy (`@/entities`, `@/integrations`), active le HMR notifier, l'analytics tracker Base44, et l'agent d'édition visuelle Base44. |
| [base44/config.jsonc](base44/config.jsonc) | Manifeste de build consommé par la plateforme Base44 (commandes install/build/serve, dossier de sortie). |

**Pour remplacer :** remplacer `base44Client.js` par un client vers le nouveau
backend (ex. wrapper `fetch`/`axios` ou SDK Supabase/Firebase), garder la même
forme d'export (`export const base44 = {...}`) pour limiter les changements
dans les 51 fichiers consommateurs, puis migrer progressivement chaque
namespace (`entities`, `auth`, `integrations`, `users`).

---

## 2. Authentification (`base44.auth.*`)

| Méthode SDK | Fichier(s) | Usage |
|---|---|---|
| `auth.me()` | [AuthContext.jsx](src/lib/AuthContext.jsx), [App.jsx](src/App.jsx), [Accueil.jsx](src/pages/Accueil.jsx), [Resume.jsx](src/pages/Resume.jsx), [DiagnosticEleve.jsx](src/pages/DiagnosticEleve.jsx), [FicheEleve.jsx](src/pages/FicheEleve.jsx), [Dashboard.jsx](src/pages/Dashboard.jsx), [Parametres.jsx](src/pages/Parametres.jsx), [MesEcoles.jsx](src/pages/MesEcoles.jsx), [DetailFiche.jsx](src/pages/DetailFiche.jsx), [PageNotFound.jsx](src/lib/PageNotFound.jsx), [usePresence.js](src/lib/usePresence.js), [BottomBar.jsx](src/components/Navigation/BottomBar.jsx), [IntervenantsSection.jsx](src/components/rased/IntervenantsSection.jsx), [NotesMembreSection.jsx](src/components/rased/NotesMembreSection.jsx), [NotificationsBadge.jsx](src/components/rased/NotificationsBadge.jsx) | Récupère l'utilisateur courant (id, email, `full_name`, `role`, `profession`, `first_login_seen`). Utilisé partout pour l'affichage conditionnel et les permissions d'édition. |
| `auth.loginViaEmailPassword()` | [Login.jsx](src/pages/Login.jsx), [Register.jsx](src/pages/Register.jsx) | Connexion par email/mot de passe. |
| `auth.register()` | [Register.jsx](src/pages/Register.jsx) | Création de compte. |
| `auth.updateMe()` | [Register.jsx](src/pages/Register.jsx), [App.jsx](src/App.jsx) | Met à jour le profil (profession, `first_login_seen`, inscription silencieuse `AutoRegister`). |
| `auth.resetPasswordRequest()` | [ForgotPassword.jsx](src/pages/ForgotPassword.jsx) | Demande de réinitialisation (déclenche un email côté Base44). |
| `auth.resetPassword()` | [ResetPassword.jsx](src/pages/ResetPassword.jsx) | Applique le nouveau mot de passe via un `resetToken`. |
| `auth.logout()` | [AuthContext.jsx](src/lib/AuthContext.jsx), [UserNotRegisteredError.jsx](src/components/UserNotRegisteredError.jsx) | Déconnexion + nettoyage du token local. |
| `auth.redirectToLogin()` | [AuthContext.jsx](src/lib/AuthContext.jsx), [FicheEleve.jsx](src/pages/FicheEleve.jsx) | Redirection vers l'écran de connexion Base44. |
| `auth.isAuthenticated` (mentionné, non utilisé comme source de vérité) | [OAuthConsent.jsx](src/pages/OAuthConsent.jsx) | Explicitement **évité** ici au profit d'un appel serveur (cf. §5). |
| `createAxiosClient` (`@base44/sdk/dist/utils/axios-client`) | [AuthContext.jsx](src/lib/AuthContext.jsx) | Appel bas niveau (hors `base44.*`) vers `GET /api/apps/public/prod/public-settings/by-id/{appId}` pour savoir si l'auth est requise / si l'utilisateur est enregistré, avant même d'avoir un client authentifié. |
| Stockage token | [AuthContext.jsx](src/lib/AuthContext.jsx) (`localStorage['base44_access_token']`) | Session persistante : un échec réseau ne déconnecte jamais l'utilisateur (comportement volontaire, cf. commentaires dans le fichier). |

**Pages/écrans dédiés à l'auth :** [Login.jsx](src/pages/Login.jsx),
[Register.jsx](src/pages/Register.jsx), [ForgotPassword.jsx](src/pages/ForgotPassword.jsx),
[ResetPassword.jsx](src/pages/ResetPassword.jsx), [AuthLayout.jsx](src/components/AuthLayout.jsx),
[auth/AuthCard.jsx](src/components/auth/AuthCard.jsx), [ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)
(garde les routes selon `useAuth()`), [authReturnTo.js](src/lib/authReturnTo.js)
(anti open-redirect sur `?returnTo=`).

**Pour remplacer :** c'est la brique la plus lourde. Il faudra un fournisseur
d'auth (ex. Supabase Auth, Auth.js, Firebase Auth, ou backend maison) exposant
au minimum : login email/mdp, register, reset password (avec envoi d'email),
« me », update profil, logout, et un mécanisme de session persistante
équivalent. Le hook `useAuth()` / `AuthContext.jsx` peut rester l'interface
interne si son contrat (mêmes champs retournés) est reproduit.

---

## 3. Système de rôles

Deux notions distinctes coexistent, toutes deux définies côté Base44 (pas de
moteur de permissions dans ce dépôt) :

- **`User.role`** (`admin` | `user`, cf. [base44/entities/User.jsonc](base44/entities/User.jsonc)) —
  rôle plateforme Base44.
- **`profession`** (`Psy EN EDA` | `MaDR` | `MaDP`) — rôle métier RASED,
  stocké à la fois sur `User` et sur `MembreEquipe`.

| Fichier | Usage du rôle |
|---|---|
| [PageNotFound.jsx](src/lib/PageNotFound.jsx) | Affiche une note admin si `user.role === 'admin'`. |
| [DetailFiche.jsx](src/pages/DetailFiche.jsx) | `canEdit = auteur de l'intervention OU admin`. |
| [Parametres.jsx](src/pages/Parametres.jsx) | Section « Suppression de données » réservée à `role === 'admin'`. |
| [MesEcoles.jsx](src/pages/MesEcoles.jsx) | `canDelete = profession === 'Psy EN EDA' OU role === 'admin'`. |
| [NotesMembreSection.jsx](src/components/rased/NotesMembreSection.jsx) | Édition/suppression d'une note réservée à son auteur ou à un admin. |
| [Register.jsx](src/pages/Register.jsx) | Fixe `role: 'user'` à la création de compte (jamais admin depuis le client). |
| [base44/functions/inviteUsers/entry.ts](base44/functions/inviteUsers/entry.ts) | **Contrôle serveur** : `403` si `user.role !== 'admin'`. |
| [base44/functions/migrateFicheEleve/entry.ts](base44/functions/migrateFicheEleve/entry.ts) | **Contrôle serveur** : `401` si pas admin, puis utilise `base44.asServiceRole.entities.*` (bypass des droits) pour migrer toutes les fiches. |
| [base44/functions/fixBouBouFiche/entry.ts](base44/functions/fixBouBouFiche/entry.ts) | Nécessite un utilisateur authentifié (pas forcément admin) + `asServiceRole` pour écrire. |

⚠️ **Point d'attention pour la migration :** les vérifications `user.role ===
'admin'` **côté client** (React) ne sont que du confort d'affichage — elles ne
protègent aucune donnée. La véritable autorisation au niveau des entités
(qui a le droit de lire/écrire quoi) est gérée **par la plateforme Base44
elle-même** (règles d'accès configurées dans le tableau de bord Base44, pas
présentes dans ce dépôt). En remplaçant Base44, il faudra **recréer ces règles
d'autorisation côté serveur/DB** (ex. Row Level Security Postgres/Supabase),
sans quoi n'importe quel utilisateur authentifié pourrait lire/modifier les
données de n'importe quel élève.

---

## 4. Entités (`base44.entities.*`) — couche données

13 des 14 entités définies dans `base44/entities/*.jsonc` sont utilisées côté
client ; `Eleve` et `Reseau` sont définies mais **non référencées** dans le
code (candidates à la suppression ou héritage d'une ancienne version).

| Entité | Schéma | Description | Fichiers l'utilisant (nb d'appels) |
|---|---|---|---|
| `FicheEleve` | [FicheEleve.jsonc](base44/entities/FicheEleve.jsonc) (295 lignes, la plus grosse) | Dossier RASED complet d'un élève : identité, scores par domaine, hypothèses, recommandations, interventions, intervenants, documents, responsables légaux, autorisation parentale, photo EE, rapport. **Contient des données personnelles sensibles (mineurs).** | Accueil, Dashboard, SyntheseEleve, StatsAnnuelles, Resultats, RapportAnnuel, Parametres, ExportAnnuel, FicheEleve, Notifications(via IntervenantsSection), HistoriqueEleve, EditEleve, DiagnosticEleve, DetailFiche, MesEcoles, ListeEleves, SaveDiagnosticButton, PhotoEEUpload, DocumentsSection, ProblematiquesSection, ResponsablesSection, EleveSelector, IntervenantsSection |
| `Diagnostic` | [Diagnostic.jsonc](base44/entities/Diagnostic.jsonc) | Résultat d'un diagnostic généré (hypothèses de travail, rapport IA). | Accueil, DiagnosticContext, TableauSynthese, StatsAnnuelles, Resume, Historique, DiagnosticEleve |
| `MembreEquipe` | [MembreEquipe.jsonc](base44/entities/MembreEquipe.jsonc) | Membre de l'équipe RASED (prénom, nom, profession, email, actif). | Accueil, Dashboard, Register, InviteUsers, Parametres, FicheEleve, EquipeRased, MesEcoles, DetailFiche, DetailEcole, IntervenantsSection, NotesMembreSection |
| `EcoleRased` | [EcoleRased.jsonc](base44/entities/EcoleRased.jsonc) | École suivie par le réseau RASED (nom, type, commune...). | Dashboard, RapportAnnuel, Parametres, ExportAnnuel, FicheEleve, EquipeRased, MesEcoles, DetailFiche, DetailEcole, AddEcoleModal, DeleteEcoleModal, ImportEcoles, ImportElevesPDF |
| `EleveRased` | [EleveRased.jsonc](base44/entities/EleveRased.jsonc) | Élève inscrit dans une école (indépendant de `FicheEleve`, alimenté par les imports PDF). | Dashboard, RapportAnnuel, Parametres, ExportAnnuel, FicheEleve, MesEcoles, DetailFiche, DetailEcole, DeleteEcoleModal, AddEleveModal, ImportStep2/3, ImportElevesPDF |
| `Notification` | [Notification.jsonc](base44/entities/Notification.jsonc) | Notifications internes (dossier partagé, fiche mise à jour, etc.). | Dashboard, Notifications, IntervenantsSection, NotesMembreSection, NotificationsBadge |
| `AnneeScolaire` | [AnneeScolaire.jsonc](base44/entities/AnneeScolaire.jsonc) | Années scolaires (libellé, dates, active). | Dashboard, RapportAnnuel, Parametres, ExportAnnuel, FicheEleve, MesEcoles, StatsAnnuelles, ImportElevesPDF, migrateFicheEleve (fonction serveur) |
| `HistoriqueEDA` | [HistoriqueEDA.jsonc](base44/entities/HistoriqueEDA.jsonc) | Historique des évaluations EDA liées à une fiche élève. | AnalyseEDA, SyntheseEleve, RapportAnnuel, Parametres, ExportAnnuel, HistoriqueEleve, DetailFiche, SaveDiagnosticButton |
| `ClasseEcole` | [ClasseEcole.jsonc](base44/entities/ClasseEcole.jsonc) | Classe rattachée à une école. | DetailFiche, DetailEcole, DeleteEcoleModal, AddEleveModal, ImportStep3, ImportElevesPDF |
| `NotesMembre` | [NotesMembre.jsonc](base44/entities/NotesMembre.jsonc) | Notes libres d'un membre sur une fiche élève. | NotesMembreSection |
| `Presence` | [Presence.jsonc](base44/entities/Presence.jsonc) | Présence temps réel (qui est en ligne, sur quelle page/fiche) — heartbeat 15s. | usePresence.js (hook), PresenceBandeau.jsx (affichage) |
| `User` | [User.jsonc](base44/entities/User.jsonc) | Compte plateforme (`role`, `profession`). Géré via `base44.auth.*`, pas via `entities.User` directement. | Voir §2 |
| `Eleve` | [Eleve.jsonc](base44/entities/Eleve.jsonc) | **Non utilisée dans le code actuel.** | — |
| `Reseau` | [Reseau.jsonc](base44/entities/Reseau.jsonc) | **Non utilisée dans le code actuel.** | — |

Opérations CRUD utilisées : `.list()`, `.filter()`, `.get()`, `.create()`,
`.update()`, `.delete()` — API type ORM minimaliste (pas de requêtes
relationnelles/jointures ; les liens entre entités se font par ID stocké en
string, ex. `eleve_id`, `fiche_id`, `membre_id`, `ecole_id`).

**Pour remplacer :** migrer chaque entité vers des tables SQL (ou collections
NoSQL) équivalentes. Les schémas JSON Schema dans `base44/entities/*.jsonc`
peuvent servir directement de base pour générer un schéma Postgres/Prisma.
Il faudra réimplémenter `list/filter/get/create/update/delete` avec la même
signature pour minimiser les changements dans les ~40 fichiers consommateurs,
**et** recréer les règles d'autorisation par entité (cf. §3).

---

## 5. Intégrations (`base44.integrations.Core.*`)

### 5.a Upload de fichiers — `UploadFile({ file })` → `{ file_url }`

| Fichier | Usage |
|---|---|
| [PhotoEEUpload.jsx](src/components/PhotoEEUpload.jsx) | Upload d'une photo (évaluation EE) liée à une fiche élève. |
| [DocumentsSection.jsx](src/components/rased/DocumentsSection.jsx) | Upload de documents libres (max 20 Mo) attachés à une fiche élève. |
| [DiagnosticEleve.jsx](src/pages/DiagnosticEleve.jsx) | Upload du rapport PDF généré (après génération via `jspdf` + IA). |
| [ImportStep2.jsx](src/components/rased/ImportStep2.jsx) | Upload du PDF de liste de classe avant extraction IA. |
| [ImportElevesPDF.jsx](src/components/rased/ImportElevesPDF.jsx) | Upload du PDF multi-classes avant extraction IA. |
| [ImportEcoles.jsx](src/components/rased/ImportEcoles.jsx) | Upload du PDF de liste d'écoles avant extraction IA. |

### 5.b Appels IA — `InvokeLLM({ prompt, model?, file_urls?, response_json_schema? })`

| Fichier | Usage | Modèle |
|---|---|---|
| [ImportStep2.jsx](src/components/rased/ImportStep2.jsx) | Extraction structurée (JSON) d'une liste de classe depuis un PDF : école, classe, enseignant, élèves. | `claude_sonnet_4_6` |
| [ImportElevesPDF.jsx](src/components/rased/ImportElevesPDF.jsx) | Extraction multi-classes depuis un PDF (Onde/Base Élèves) : école + classes + élèves. | (non précisé, défaut plateforme) |
| [ImportEcoles.jsx](src/components/rased/ImportEcoles.jsx) | Extraction d'une liste d'écoles de circonscription depuis un PDF. | (non précisé, défaut plateforme) |
| [Resume.jsx](src/pages/Resume.jsx) | Génération d'un rapport clinique structuré (4 parties) à partir des observations cochées. | (non précisé, défaut plateforme) |
| [DiagnosticEleve.jsx](src/pages/DiagnosticEleve.jsx) | Génération d'un rapport d'hypothèses de travail (synthèse, hypothèses, orientations, préconisations). | `claude_sonnet_4_6` |

Tous les prompts sont rédigés en français et attendent en retour soit du texte
libre (rapports), soit un objet respectant un `response_json_schema` fourni
inline (extraction de PDF). Aucun de ces schémas/prompts n'est centralisé —
ils sont dupliqués dans chaque composant.

**Pour remplacer :**
- *Upload* : n'importe quel stockage objet (S3, Supabase Storage, Cloudflare
  R2...) exposant une fonction qui renvoie une URL publique/signée — signature
  simple à reproduire.
- *IA* : remplacer par un appel direct à l'API Anthropic (ou autre fournisseur)
  côté **serveur** (jamais depuis le navigateur, pour ne pas exposer une clé
  API) — donc prévoir un petit backend/proxy. Pour l'extraction PDF, vérifier
  si le nouveau fournisseur supporte les pièces jointes PDF nativement (comme
  `file_urls` ici) ou s'il faut une étape d'OCR/texte préalable. Le paramètre
  `response_json_schema` correspond au **structured output** de l'API Claude
  (`tool_use` ou `response_format`) — à réimplémenter côté serveur.

---

## 6. Invitations & gestion des comptes (`base44.users.*`)

| Fichier | Usage |
|---|---|
| [EquipeRased.jsx](src/pages/EquipeRased.jsx) | `base44.users.inviteUser(email, 'user')` — invite un utilisateur avec le rôle plateforme `user`. |
| [InviteUsers.jsx](src/pages/InviteUsers.jsx) | Génère un **lien d'inscription** (`/register?email=...&role=...`) à transmettre manuellement — nécessite que l'auth par mot de passe soit activée dans le dashboard Base44 (message d'avertissement affiché à l'écran). N'appelle pas `inviteUser` directement, crée un `MembreEquipe` en attente. |
| [base44/functions/inviteUsers/entry.ts](base44/functions/inviteUsers/entry.ts) | Fonction serveur admin-only qui invite en masse une liste d'emails codée en dur (les 3 adresses des membres de l'équipe RASED — voir remarque §8 sur les PII en dur). |

**Pour remplacer :** dépend du fournisseur d'auth choisi ; la plupart
(Supabase, Auth0, Clerk...) ont un équivalent « invite by email ».

---

## 7. Fonctions serveur (Deno, `base44/functions/*/entry.ts`)

Ces fonctions tournent côté plateforme Base44 (runtime Deno), pas dans ce
dépôt front-end, mais leur code source est versionné ici :

| Fonction | Fichier | Rôle |
|---|---|---|
| `inviteUsers` | [entry.ts](base44/functions/inviteUsers/entry.ts) | Invite en masse (admin only). |
| `migrateFicheEleve` | [entry.ts](base44/functions/migrateFicheEleve/entry.ts) | Migration ponctuelle de données (admin only), utilise `base44.asServiceRole` pour bypasser les droits d'accès normaux. |
| `fixBouBouFiche` | [entry.ts](base44/functions/fixBouBouFiche/entry.ts) | Correctif ponctuel sur une fiche précise, `asServiceRole`. |

Ces trois fonctions utilisent `createClientFromRequest` (`npm:@base44/sdk`)
pour obtenir un client authentifié à partir de la requête entrante, et
`base44.asServiceRole.entities.*` pour les opérations qui doivent ignorer les
règles d'accès normales (équivalent d'une clé « service role » Supabase).

**Pour remplacer :** ce sont des scripts d'admin ponctuels (migrations/
correctifs), pas des fonctionnalités produit — probablement à ne **pas**
reporter telles quelles, plutôt à rejouer une fois comme scripts de migration
SQL lors du passage au nouveau backend.

---

## 8. OAuth / MCP (agents IA tiers) & appels REST directs

[OAuthConsent.jsx](src/pages/OAuthConsent.jsx) est un point d'intégration à
part : c'est un écran de **consentement OAuth** que la plateforme Base44
affiche quand un client IA externe (agent MCP) demande l'accès à l'app au nom
d'un utilisateur. Contrairement au reste du code, il n'utilise **pas** le SDK
`base44.*` mais appelle directement l'API REST de la plateforme :

- `GET /api/apps/{appId}/mcp/consent-info?handle=...`
- `POST /api/apps/{appId}/mcp/authorize-grant`

Le fichier contient des commentaires explicites indiquant que la logique est
sensible à la sécurité (protection contre les redirections ouvertes, gestion
des sessions cookie vs bearer) et ne doit pas être modifiée sans précaution.

**Pour remplacer :** fonctionnalité avancée et probablement hors périmètre
d'une migration initiale — à traiter en dernier, voire à abandonner si l'app
n'a pas vocation à être pilotée par des agents IA externes une fois hors de
Base44 (le protocole MCP tel qu'exposé ici est spécifique à la plateforme
Base44).

---

## 9. Vérification des secrets (demande §1)

- **Aucun secret/clé API en dur** trouvé dans le code source actuel (recherche
  par motifs `api[_-]?key`, `secret`, `token`, `password`, `bearer`, formats de
  clés connus AWS/Stripe/OpenAI/GitHub/Slack, blocs `-----BEGIN ... PRIVATE
  KEY-----`).
- Les seules occurrences de ces mots-clés sont des **noms de variables/champs
  UI** légitimes (`token` = jeton de session utilisateur passé en paramètre,
  jamais une clé d'API ; `role` = rôle utilisateur ; `password` = champ de
  formulaire).
- `.env` et `.env.*` sont correctement listés dans [.gitignore](.gitignore) ;
  **aucun fichier `.env` n'existe sur le disque ni n'a jamais été commité**
  (vérifié sur tout l'historique Git, toutes branches, y compris fichiers
  supprimés).
- Recherche du même type de motifs sur **tout l'historique Git** (`git log
  --all -p`) : aucun résultat.
- La config `appId` / `token` / `appBaseUrl` passe par des variables d'env
  Vite (`VITE_BASE44_*`, non présentes dans le dépôt) ou par des paramètres
  d'URL/`localStorage` — pas de valeur en dur.

⚠️ **Remarque hors-scope « secrets » mais liée aux données sensibles :**
[base44/functions/inviteUsers/entry.ts](base44/functions/inviteUsers/entry.ts)
contient trois adresses email personnelles en dur (dont la vôtre) comme valeur
par défaut. Ce ne sont pas des secrets d'authentification, mais ce sont des
données personnelles versionnées dans le dépôt — à signaler si le dépôt doit
devenir public.

---

## 10. Synthèse : effort de remplacement par brique

| Brique | Fichiers concernés (approx.) | Complexité | Priorité suggérée |
|---|---|---|---|
| Client SDK central | 1 fichier pivot (`base44Client.js`) + `app-params.js` | Faible à isoler, mais tout en dépend | À faire en premier (façade) |
| Entités / base de données | ~40 fichiers, 14 schémas | Moyenne — CRUD simple, mais **sans règles d'autorisation existantes à copier** (à concevoir) | Haute |
| Authentification & rôles | ~20 fichiers | Élevée — sessions, reset password par email, rôles, contrôle serveur | Haute |
| Upload de fichiers | 6 fichiers | Faible | Moyenne |
| Appels IA (InvokeLLM) | 5 fichiers, prompts dupliqués | Moyenne — nécessite un proxy serveur + structured output | Moyenne |
| Invitations utilisateurs | 3 fichiers + 1 fonction serveur | Faible à moyenne | Basse |
| Fonctions serveur (migrations ponctuelles) | 3 fichiers | À rejouer une fois, pas à porter | Basse |
| OAuth/MCP (agents IA) | 1 fichier | Élevée si conservé, sinon nulle | Basse / à discuter |
