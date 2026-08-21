# Suite a faire - import PDF eleves

Etat au 2026-08-21. Deux correctifs commit/push (voir commit associe) mais
**non testes en navigateur** : la fenetre Chromium pilotee par automatisation
s'est averee trop instable pour mener les tests jusqu'au bout (crashs
repetes, blocage de la connexion Google par detection d'automatisation).

## 1. Tests manuels a faire avant de considerer le correctif valide

Fichiers concernes : `src/components/rased/ImportElevesPDF.jsx`,
`src/lib/utils.js` (fonction `normalizeName`).

Preparer une ecole de test nommee explicitement **« ZZZ Test ecole »**
(avec accent) et un PDF factice avec des noms d'eleves entierement
inventes (jamais une vraie liste de classe). Ne toucher a aucune ecole
reelle ni fiche de suivi existante. A la fin, supprimer l'ecole de test et
verifier par une requete (pas seulement l'absence d'erreur) que l'ecole et
ses eleves ont bien disparu.

**Cas 1 (le plus important)** : import lance depuis la fiche de l'ecole de
test (donc avec `ecoleId` dans l'URL), avec un PDF dont le nom d'ecole
differe legerement (ex : « Ecole ZZZ Test ecole » sans accent).
Attendu : aucune ecole creee, eleves rattaches a l'ecole de test existante.
C'est le scenario de la regression qui avait produit le doublon
« Paul Langevin ».

**Cas 2** : import generique sans `ecoleId` (depuis `/import-pdf` ou le
Dashboard), avec un nom d'ecole dans le PDF qui correspond a l'ecole de
test apres normalisation (ex : « ECOLE ZZZ TEST ECOLE » tout en
majuscules, sans accent).
Attendu : rattachement a l'ecole de test existante, aucun doublon cree.

**Cas 3** : import generique sans `ecoleId`, avec un nom d'ecole introuvable
meme apres normalisation.
Attendu : l'import se bloque, message d'erreur explicite affiche, aucune
ecole creee.

Verifier aussi que la regex de suppression des diacritiques dans
`normalizeName` porte bien le flag `u` (`/\p{Diacritic}/gu` — sans `/u`,
`\p{Diacritic}` leve une erreur de syntaxe regex).

## 2. Audit des `list()` non pagines

Plusieurs appels recuperent au maximum un nombre fixe d'enregistrements
sans pagination, dont `EcoleRased.list('-nom', 200)` dans
`ImportElevesPDF.jsx`. A faire :

- Reperer tous les `list()` du projet (`base44.entities.*.list(...)`).
- Signaler ceux dont la limite fixe peut etre depassee en usage reel.
- Proposer un utilitaire de pagination reutilisable pour les remplacer.

A traiter apres validation du point 1.
