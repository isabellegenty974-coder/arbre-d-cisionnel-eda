# Guide de migration vers un hébergement local

Ce document décrit le mapping entre les entités Base44 actuelles et un schéma SQL cible (PostgreSQL recommandé), ainsi que les adaptations nécessaires pour un fonctionnement 100 % local.

---

## 1. Schéma SQL cible

### Tables principales

```sql
-- ============================================================
-- ANNEE SCOLAIRE
-- ============================================================
CREATE TABLE annee_scolaire (
    id              SERIAL PRIMARY KEY,
    libelle         VARCHAR(20) NOT NULL,           -- ex: "2025-2026"
    date_debut      DATE NOT NULL,                  -- 15 août
    date_fin        DATE NOT NULL,                  -- 15 juillet suivant
    statut          VARCHAR(20) DEFAULT 'a_venir',  -- en_cours | a_venir | archivee
    est_active      BOOLEAN DEFAULT FALSE,
    created_date    TIMESTAMP DEFAULT NOW(),
    updated_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MEMBRE EQUIPE RASED
-- ============================================================
CREATE TABLE membre_equipe (
    id              SERIAL PRIMARY KEY,
    civilite        VARCHAR(5),                     -- Mme | M.
    prenom          VARCHAR(100) NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    profession      VARCHAR(50) NOT NULL,           -- MaDP | MaDR | Psy EN EDA
    email           VARCHAR(255) UNIQUE,
    actif           BOOLEAN DEFAULT TRUE,
    user_id         VARCHAR(255),                   -- lien vers l'utilisateur local (auth)
    created_date    TIMESTAMP DEFAULT NOW(),
    updated_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ECOLE
-- ============================================================
CREATE TABLE ecole_rased (
    id                      SERIAL PRIMARY KEY,
    nom                     VARCHAR(255) NOT NULL,
    type                    VARCHAR(20),              -- Maternelle | Élémentaire | Les deux
    commune                 VARCHAR(100),
    adresse                 TEXT,
    telephone               VARCHAR(50),
    email                   VARCHAR(255),
    directeur               VARCHAR(255),
    jour_decharge_directeur TEXT,
    nombre_classes          INTEGER,
    reseau_id               INTEGER REFERENCES reseau(id) ON DELETE SET NULL,
    created_date            TIMESTAMP DEFAULT NOW(),
    updated_date            TIMESTAMP DEFAULT NOW()
);

-- Table de liaison école <-> membres RASED (relation N-N)
CREATE TABLE ecole_membre (
    ecole_id    INTEGER REFERENCES ecole_rased(id) ON DELETE CASCADE,
    membre_id   INTEGER REFERENCES membre_equipe(id) ON DELETE CASCADE,
    PRIMARY KEY (ecole_id, membre_id)
);

-- ============================================================
-- CLASSE
-- ============================================================
CREATE TABLE classe_ecole (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL,                -- CP, CE1, CM2...
    enseignant  VARCHAR(255),
    ecole_id    INTEGER REFERENCES ecole_rased(id) ON DELETE CASCADE,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ELEVE RASED (suivi global)
-- ============================================================
CREATE TABLE eleve_rased (
    id                  SERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    date_naissance      DATE,
    classe_id           INTEGER REFERENCES classe_ecole(id) ON DELETE SET NULL,
    ecole_id             INTEGER REFERENCES ecole_rased(id) ON DELETE SET NULL,
    statut              VARCHAR(20) DEFAULT 'Nouveau', -- Nouveau | Suivi actif | En attente | Clôturé
    date_derniere_action DATE,
    motif_signalement   TEXT,
    fiche_eleve_id      INTEGER REFERENCES fiche_eleve(id) ON DELETE SET NULL,
    origine_import_pdf  BOOLEAN DEFAULT FALSE,
    created_date        TIMESTAMP DEFAULT NOW(),
    updated_date        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- FICHE ELEVE (dossier détaillé EDA)
-- ============================================================
CREATE TABLE fiche_eleve (
    id                      SERIAL PRIMARY KEY,
    nom                     VARCHAR(100) NOT NULL,
    prenom                  VARCHAR(100) NOT NULL,
    classe                  VARCHAR(50),
    ecole                   VARCHAR(255),
    age                     INTEGER,
    date_naissance          DATE,
    observations            TEXT,
    notes                   TEXT,
    score_apprentissages    DECIMAL(5,2),
    score_comportement      DECIMAL(5,2),
    score_developpement     DECIMAL(5,2),
    score_contexte          DECIMAL(5,2),
    hypotheses              JSONB,                   -- array de strings
    recommandations         JSONB,                   -- array de strings
    date                    DATE,
    annee_scolaire          VARCHAR(20),
    created_by_name         VARCHAR(255),
    created_by_profession   VARCHAR(50),
    photo_ee_url            TEXT,
    rapport                 TEXT,
    statut                  VARCHAR(20) DEFAULT 'Nouveau',
    langue_maison           VARCHAR(100),
    autorisation_parentale  BOOLEAN,
    date_autorisation       DATE,
    created_date            TIMESTAMP DEFAULT NOW(),
    updated_date            TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INTERVENTIONS (sous-table de fiche_eleve)
-- ============================================================
CREATE TABLE intervention (
    id              SERIAL PRIMARY KEY,
    fiche_eleve_id  INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    date            DATE,
    profession      VARCHAR(50),                    -- Psy EN EDA | MaDR | MaDP
    description     TEXT,
    created_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INTERVENANTS (membres ayant accès à une fiche)
-- ============================================================
CREATE TABLE fiche_intervenant (
    id              SERIAL PRIMARY KEY,
    fiche_eleve_id  INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    membre_id       INTEGER REFERENCES membre_equipe(id) ON DELETE CASCADE,
    acces           VARCHAR(20) DEFAULT 'lecture',  -- lecture | commentaire | modification
    created_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS (fichiers liés à une fiche)
-- ============================================================
CREATE TABLE document (
    id              SERIAL PRIMARY KEY,
    fiche_eleve_id  INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    url             TEXT,                           -- chemin local: /uploads/...
    size            BIGINT,
    type            VARCHAR(100),
    uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PROBLEMATIQUES (cases cochées par catégorie)
-- ============================================================
CREATE TABLE problematic (
    id              SERIAL PRIMARY KEY,
    fiche_eleve_id  INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    categorie        VARCHAR(50),                   -- apprentissages | comportement | developpement | contexte | autre
    valeur           TEXT,                           -- libellé de la problématique cochée
    created_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- RESPONSABLES LÉGAUX
-- ============================================================
CREATE TABLE responsable_legal (
    id              SERIAL PRIMARY KEY,
    fiche_eleve_id  INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    ordre           INTEGER,                         -- 1 ou 2
    lien            VARCHAR(50),                    -- Père | Mère | Tuteur | Autre
    prenom_nom      VARCHAR(255),
    tel_portable    VARCHAR(50),
    tel_fixe        VARCHAR(50),
    email           VARCHAR(255)
);

-- ============================================================
-- NOTES MEMBRE (notes personnelles par membre sur une fiche)
-- ============================================================
CREATE TABLE notes_membre (
    id                  SERIAL PRIMARY KEY,
    fiche_id            INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    membre_id           INTEGER REFERENCES membre_equipe(id) ON DELETE CASCADE,
    contenu             TEXT,
    updated_at          TIMESTAMP DEFAULT NOW(),
    created_date        TIMESTAMP DEFAULT NOW(),
    UNIQUE (fiche_id, membre_id)
);

-- ============================================================
-- RAPPELS ÉLÈVE (tâches / à faire)
-- ============================================================
CREATE TABLE rappel_eleve (
    id          SERIAL PRIMARY KEY,
    fiche_id    INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    eleve_nom   VARCHAR(255),
    texte       TEXT NOT NULL,
    echeance    DATE,
    fait        BOOLEAN DEFAULT FALSE,
    auteur_nom  VARCHAR(255),
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- HISTORIQUE EDA
-- ============================================================
CREATE TABLE historique_eda (
    id              SERIAL PRIMARY KEY,
    eleve_id        INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    domaine         VARCHAR(100),
    sous_domaine    VARCHAR(100),
    hypotheses      JSONB,
    recommandations JSONB,
    scores          JSONB,
    diagnostic_id   INTEGER,
    created_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notification (
    id                  SERIAL PRIMARY KEY,
    type                VARCHAR(50) NOT NULL,
    titre               VARCHAR(255) NOT NULL,
    message             TEXT,
    fiche_id            INTEGER REFERENCES fiche_eleve(id) ON DELETE CASCADE,
    eleve_nom           VARCHAR(255),
    destinataire_email  VARCHAR(255),
    lu                  BOOLEAN DEFAULT FALSE,
    expediteur_nom      VARCHAR(255),
    created_date        TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRÉSENCE (qui consulte quelle fiche)
-- ============================================================
CREATE TABLE presence (
    id              SERIAL PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL,
    user_name       VARCHAR(255) NOT NULL,
    user_profession VARCHAR(50),
    fiche_id        INTEGER REFERENCES fiche_eleve(id) ON DELETE SET NULL,
    page            VARCHAR(255),
    last_seen       TIMESTAMP,
    is_online       BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- RESEAU
-- ============================================================
CREATE TABLE reseau (
    id              SERIAL PRIMARY KEY,
    nom             VARCHAR(255) NOT NULL,
    annee_scolaire  VARCHAR(20),
    circonscription VARCHAR(255),
    created_date    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- UTILISATEURS (auth locale)
-- ============================================================
CREATE TABLE app_user (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    full_name   VARCHAR(255),
    role        VARCHAR(20) DEFAULT 'user',          -- user | admin
    password_hash VARCHAR(255) NOT NULL,            -- bcrypt/argon2
    first_login_seen BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Mapping des appels SDK → API locale

| Appel Base44 (frontend) | Équivalent API locale (fetch) |
|---|---|
| `base44.entities.FicheEleve.list()` | `GET /api/fiches` |
| `base44.entities.FicheEleve.list('-updated_date', 20)` | `GET /api/fiches?sort=-updated_date&limit=20` |
| `base44.entities.FicheEleve.filter({statut:'Suivi actif'})` | `GET /api/fiches?statut=Suivi%20actif` |
| `base44.entities.FicheEleve.get(id)` | `GET /api/fiches/:id` |
| `base44.entities.FicheEleve.create(data)` | `POST /api/fiches` (body: data) |
| `base44.entities.FicheEleve.update(id, data)` | `PUT /api/fiches/:id` (body: data) |
| `base44.entities.FicheEleve.delete(id)` | `DELETE /api/fiches/:id` |
| `base44.entities.FicheEleve.bulkCreate([...])` | `POST /api/fiches/bulk` (body: array) |
| `base44.entities.FicheEleve.deleteMany({statut:'Clôturé'})` | `DELETE /api/fiches?statut=Clôturé` |
| `base44.auth.me()` | `GET /api/auth/me` |
| `base44.auth.updateMe(data)` | `PUT /api/auth/me` (body: data) |
| `base44.auth.isAuthenticated()` | vérifier token JWT en localStorage |
| `base44.auth.logout()` | `POST /api/auth/logout` + suppression token local |
| `base44.auth.redirectToLogin()` | `navigate('/login')` |
| `base44.users.inviteUser(email, role)` | `POST /api/users/invite` (body: {email, role}) |
| `base44.integrations.Core.UploadFile({file})` | `POST /api/uploads` (multipart/form-data) |
| `base44.integrations.Core.SendEmail(...)` | `POST /api/emails` (via SMTP local) |
| `base44.integrations.Core.InvokeLLM(...)` | `POST /api/llm` (modèle local Ollama) ou supprimer |

---

## 3. Adaptations du frontend

### Fichier à remplacer : `src/api/base44Client.js`

Créer un client API local qui expose la même interface que `base44` :

```js
// src/api/localClient.js (exemple de structure)
const API_BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('local_auth_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const localClient = {
  entities: {
    FicheEleve: {
      list: (sort, limit) => request(`/fiches${sort ? `?sort=${sort}` : ''}${limit ? `&limit=${limit}` : ''}`),
      filter: (query, sort, limit) => request(`/fiches?${new URLSearchParams(query)}${sort ? `&sort=${sort}` : ''}`),
      get: (id) => request(`/fiches/${id}`),
      create: (data) => request('/fiches', { method: 'POST', body: data }),
      update: (id, data) => request(`/fiches/${id}`, { method: 'PUT', body: data }),
      delete: (id) => request(`/fiches/${id}`, { method: 'DELETE' }),
      bulkCreate: (arr) => request('/fiches/bulk', { method: 'POST', body: arr }),
      deleteMany: (query) => request(`/fiches?${new URLSearchParams(query)}`, { method: 'DELETE' }),
    },
    // ... répéter pour chaque entité
  },
  auth: {
    me: () => request('/auth/me'),
    isAuthenticated: async () => !!localStorage.getItem('local_auth_token'),
    logout: () => { localStorage.removeItem('local_auth_token'); },
    redirectToLogin: () => { window.location.href = '/login'; },
    updateMe: (data) => request('/auth/me', { method: 'PUT', body: data }),
  },
  users: {
    inviteUser: (email, role) => request('/users/invite', { method: 'POST', body: { email, role } }),
  },
};
```

Puis remplacer dans tous les fichiers :
```js
// Avant
import { base44 } from '@/api/base44Client';
// Après
import { localClient as base44 } from '@/api/localClient';
```

---

## 4. Authentification locale

Remplacer Google OAuth par une auth locale :

- **Côté serveur** : endpoint `POST /api/auth/login` qui vérifie email + mot de passe (bcrypt) et renvoie un JWT.
- **Côté frontend** : page de login locale (email + mot de passe) qui stocke le JWT en `localStorage`.
- **Invitations** : l'admin crée un compte (email + mot de passe temporaire) via `POST /api/users/invite`, l'utilisateur change son mot de passe à la première connexion.

---

## 5. Stockage de fichiers local

- Créer un dossier `/uploads` sur le serveur.
- Endpoint `POST /api/uploads` (multipart) qui sauvegarde le fichier et renvoie `{ file_url: "/uploads/filename.pdf" }`.
- Servir les fichiers via un routeur statique (Express `express.static('uploads')`).

---

## 6. Rapports PDF

Vos rapports sont déjà générés côté client avec `jsPDF` (voir `src/lib/rapportAnnuelGenerator.js` et `src/lib/rapportSuiviGenerator.js`) — **aucune modification nécessaire**, ils fonctionneront en local.

---

## 7. Notifications temps réel (présence)

La fonctionnalité de présence (`usePresence.js`) utilise les subscriptions Base44. Pour le local :
- Remplacer par **WebSockets** (Socket.io) entre le frontend et le serveur local.
- Le serveur émet un événement `presence_update` à chaque changement.

---

## 8. Stack technique recommandée

| Couche | Technologie |
|---|---|
| Frontend | React + Vite (déjà en place, build statique `npm run build`) |
| Backend | Node.js + Express (ou Fastify) |
| Base de données | PostgreSQL (recommandé) ou SQLite (plus léger) |
| Auth | JWT + bcrypt |
| Stockage fichiers | Dossier local + Express static |
| WebSockets | Socket.io (pour présence/notifications) |
| Email | Nodemailer + SMTP de l'académie |
| LLM (optionnel) | Ollama en local, ou supprimer la fonctionnalité |

---

## 9. Ordre de migration recommandé

1. **Installer PostgreSQL** et créer le schéma SQL ci-dessus.
2. **Créer le serveur Express** avec les endpoints CRUD de base (commencer par `FicheEleve`).
3. **Créer `localClient.js`** et tester sur une page (Dashboard).
4. **Migrer page par page** : remplacer les imports `base44` par `localClient` et tester.
5. **Implémenter l'auth locale** et remplacer le flux Google OAuth.
6. **Migrer le stockage de fichiers** (uploads).
7. **Migrer les WebSockets** pour la présence.
8. **Tester en mode hors-ligne complet** (couper internet et vérifier que tout fonctionne).

---

## 10. Données à migrer

Pour exporter les données existantes de Base44 vers le local :
- Utiliser `base44.entities.Xxx.list()` avec pagination pour chaque entité.
- Insérer via `INSERT INTO ...` en SQL ou via un script de migration Node.js.
- Les fichiers stockés (photos EE, documents) doivent être téléchargés depuis leurs URLs Base44 et sauvegardés localement.

---

*Document généré pour faciliter la migration future. L'app peut continuer à fonctionner sur Base44 pendant la transition.*