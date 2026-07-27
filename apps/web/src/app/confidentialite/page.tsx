import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Bara collecte, utilise et protège vos données personnelles.",
  // noindex tant que le document n'a pas été validé juridiquement.
  robots: { index: false, follow: true },
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-stone-500">Dernière mise à jour : juillet 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-stone-700">
        <section>
          <h2 className="text-xl font-bold">1. Données collectées</h2>
          <p className="mt-2">
            Nous collectons les informations que vous fournissez à
            l&apos;inscription (identité, contact, pièce d&apos;identité), le
            contenu que vous créez (CV, profil, offres) et des données
            techniques nécessaires au fonctionnement du service.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">2. Pièces d&apos;identité</h2>
          <p className="mt-2">
            Votre pièce d&apos;identité sert exclusivement à vérifier votre
            compte. Elle est stockée de manière sécurisée et privée, n&apos;est
            jamais visible publiquement, et n&apos;est accessible qu&apos;à
            l&apos;équipe de vérification de Bara.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">3. Utilisation des données</h2>
          <p className="mt-2">
            Vos données servent au fonctionnement de la plateforme : afficher
            votre profil aux recruteurs, permettre la mise en relation,
            sécuriser les comptes. Nous ne vendons pas vos données.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">4. Vos droits</h2>
          <p className="mt-2">
            Vous pouvez consulter, corriger ou supprimer vos données et votre
            compte à tout moment. Pour toute demande, contactez-nous via la
            page contact.
          </p>
        </section>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Document provisoire — cette version sera complétée et validée
          juridiquement avant le lancement officiel de la plateforme.
        </section>
      </div>
    </main>
  );
}
