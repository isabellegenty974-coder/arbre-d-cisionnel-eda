import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Retour */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>

        {/* Contenu */}
        <article className="prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-6">Politique de Confidentialité</h1>
          
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Informations que nous collectons</h2>
            <p className="text-foreground mb-4">
              L'application collecte les informations suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Données de profil (nom, prénom, âge, classe)</li>
              <li>Données de diagnostic (sélections et hypothèses)</li>
              <li>Données d'utilisation de l'application</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Utilisation des données</h2>
            <p className="text-foreground mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Fournir et améliorer les services diagnostiques</li>
              <li>Générer des rapports et recommandations personnalisés</li>
              <li>Conserver l'historique des diagnostics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Stockage et sécurité</h2>
            <p className="text-foreground">
              Les données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Autorisations</h2>
            <p className="text-foreground">
              L'application peut demander l'accès à la caméra pour permettre le téléchargement de documents ou photos à des fins diagnostiques.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Droits de l'utilisateur</h2>
            <p className="text-foreground mb-4">
              Vous avez le droit de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Accéder à vos données</li>
              <li>Corriger vos informations</li>
              <li>Demander la suppression de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Contact</h2>
            <p className="text-foreground">
              Pour toute question concernant cette politique de confidentialité, veuillez nous contacter.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}