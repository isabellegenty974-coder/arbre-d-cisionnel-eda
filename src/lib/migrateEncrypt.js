// Migration ponctuelle : chiffre les fiches élèves existantes (FicheEleve + EleveRased).
// Mode « à blanc » (dryRun = true) : affiche ce qui serait fait sans rien modifier.
// Mode réel (dryRun = false) : chiffre nom/prenom/date_naissance + ajoute _fp, puis update.
//
// Champs chiffrés : nom, prenom, date_naissance (voir encryptedFields.js).
// Détecte les fiches déjà chiffrées (nom commence par 'enc:') et les ignore.

import { base44 } from '@/api/base44Client';
import { fetchAllPages } from './fetchAllPages';
import { encryptEleveFields, isEncrypted, ENCRYPTED_FIELDS } from './encryptedFields';
import { getKeyMaterial } from './crypto.js';

// Analyse une entité : renvoie la liste des enregistrements à chiffrer + stats.
async function analyzeEntity(entityName) {
  const records = await fetchAllPages(entityName, '-created_date', { throwOnError: true });
  const toEncrypt = [];
  let alreadyEncrypted = 0;
  let missingNom = 0;

  for (const rec of records) {
    if (!rec.nom) { missingNom++; continue; }
    if (isEncrypted(rec.nom)) { alreadyEncrypted++; continue; }
    toEncrypt.push(rec);
  }

  return { entityName, total: records.length, toEncrypt, alreadyEncrypted, missingNom };
}

// Exécute la migration.
// onProgress(rapport) est appelé à chaque étape pour mettre à jour l'UI.
export async function runEncryptionMigration({ dryRun = true, onProgress = null } = {}) {
  const report = {
    dryRun,
    startedAt: new Date().toISOString(),
    entities: [],
    summary: { totalRecords: 0, toEncrypt: 0, encrypted: 0, alreadyEncrypted: 0, errors: 0, skipped: 0 },
    details: [],
  };

  const emit = (msg) => {
    report.details.push(msg);
    if (onProgress) onProgress({ ...report, currentStep: msg });
  };

  // Vérifier que le crypto est déverrouillé
  const km = getKeyMaterial();
  if (!km) {
    emit('ERREUR : Crypto verrouillé. Déverrouillez avec votre phrase de passe avant de lancer la migration.');
    report.error = 'Crypto verrouillé';
    return report;
  }

  emit(`Mode ${dryRun ? 'À BLANC (simulation, aucune modification)' : 'RÉEL (modification des enregistrements)'}`);
  emit(`Clé maîtresse disponible : oui`);
  emit('');

  const entities = ['FicheEleve', 'EleveRased'];

  for (const entityName of entities) {
    emit(`--- ${entityName} ---`);
    let analysis;
    try {
      analysis = await analyzeEntity(entityName);
    } catch (err) {
      emit(`ERREUR lors de la lecture de ${entityName} : ${err.message}`);
      report.entities.push({ entityName, error: err.message });
      continue;
    }

    emit(`Total d'enregistrements : ${analysis.total}`);
    emit(`Déjà chiffrés (ignorés) : ${analysis.alreadyEncrypted}`);
    emit(`Sans nom (ignorés) : ${analysis.missingNom}`);
    emit(`À chiffrer : ${analysis.toEncrypt.length}`);

    report.summary.totalRecords += analysis.total;
    report.summary.alreadyEncrypted += analysis.alreadyEncrypted;
    report.summary.skipped += analysis.missingNom;
    report.summary.toEncrypt += analysis.toEncrypt.length;

    if (dryRun) {
      // Mode à blanc : afficher les 20 premiers enregistrements concernés
      const preview = analysis.toEncrypt.slice(0, 20);
      for (const rec of preview) {
        const nom = rec.nom || '(vide)';
        const prenom = rec.prenom || '(vide)';
        const dn = rec.date_naissance || '(aucune)';
        emit(`  → [${rec.id}] "${nom} ${prenom}" (né(e) ${dn}) serait chiffré`);
      }
      if (analysis.toEncrypt.length > preview.length) {
        emit(`  … et ${analysis.toEncrypt.length - preview.length} autre(s) enregistrement(s)`);
      }
      emit('');
    } else {
      // Mode réel : chiffrer et mettre à jour
      let done = 0;
      let errors = 0;
      for (const rec of analysis.toEncrypt) {
        try {
          const encrypted = await encryptEleveFields({
            nom: rec.nom,
            prenom: rec.prenom,
            date_naissance: rec.date_naissance,
          });
          await base44.entities[entityName].update(rec.id, {
            nom: encrypted.nom,
            prenom: encrypted.prenom,
            date_naissance: encrypted.date_naissance,
            _fp: encrypted._fp,
          });
          done++;
          if (done % 10 === 0) emit(`  ${done}/${analysis.toEncrypt.length} chiffrés…`);
        } catch (err) {
          errors++;
          emit(`  ERREUR [${rec.id}] "${rec.nom}" : ${err.message}`);
        }
      }
      emit(`Chiffrés : ${done} / ${analysis.toEncrypt.length} (erreurs : ${errors})`);
      emit('');
      report.summary.encrypted += done;
      report.summary.errors += errors;
    }

    report.entities.push({
      entityName,
      total: analysis.total,
      toEncrypt: analysis.toEncrypt.length,
      alreadyEncrypted: analysis.alreadyEncrypted,
      missingNom: analysis.missingNom,
    });
  }

  emit('=== RÉCAPITULATIF ===');
  emit(`Total enregistrements lus : ${report.summary.totalRecords}`);
  emit(`Déjà chiffrés : ${report.summary.alreadyEncrypted}`);
  emit(`Sans nom (ignorés) : ${report.summary.skipped}`);
  emit(`À chiffrer : ${report.summary.toEncrypt}`);
  if (!dryRun) {
    emit(`Chiffrés avec succès : ${report.summary.encrypted}`);
    emit(`Erreurs : ${report.summary.errors}`);
  } else {
    emit(`Aucune modification effectuée (mode à blanc).`);
  }

  report.completedAt = new Date().toISOString();
  return report;
}