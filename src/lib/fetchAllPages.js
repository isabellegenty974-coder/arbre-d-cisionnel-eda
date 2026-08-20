import { base44 } from '@/api/base44Client';

const PAGE_SIZE = 500;

// Le SDK Base44 n'expose pas de count() : list() est plafonné par le serveur
// (500 par appel), donc on pagine avec skip jusqu'à une page incomplète pour
// charger la collection entière plutôt que le plafond du premier appel.
export async function fetchAllPages(entityName, sort) {
  const all = [];
  let skip = 0;
  for (;;) {
    const page = await base44.entities[entityName].list(sort, PAGE_SIZE, skip).catch(() => []);
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
  return all;
}
