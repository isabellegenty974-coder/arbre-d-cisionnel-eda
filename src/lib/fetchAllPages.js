import { base44 } from '@/api/base44Client';

const PAGE_SIZE = 500;

// Le SDK Base44 n'expose pas de count() : list()/filter() sont plafonnés par
// le serveur (500 par appel), donc on pagine avec skip jusqu'à une page
// incomplète pour charger la collection entière plutôt que le plafond du
// premier appel.
//
// `query` bascule sur `.filter()` au lieu de `.list()`. `throwOnError` fait
// remonter l'erreur au lieu de renvoyer silencieusement une liste vide — par
// défaut désactivé pour ne pas changer le comportement des appelants
// existants, qui ignorent volontairement les échecs de chargement.
export async function fetchAllPages(entityName, sort, { query, throwOnError = false } = {}) {
  const all = [];
  let skip = 0;
  for (;;) {
    let page;
    try {
      page = query
        ? await base44.entities[entityName].filter(query, sort, PAGE_SIZE, skip)
        : await base44.entities[entityName].list(sort, PAGE_SIZE, skip);
    } catch (err) {
      if (throwOnError) throw err;
      page = [];
    }
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
  return all;
}
