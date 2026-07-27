import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation de la plateforme Bara.",
  // noindex tant que le document n'a pas été validé juridiquement.
  robots: { index: false, follow: true },
  alternates: { canonical: "/conditions" },
};

export default function ConditionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Conditions d&apos;utilisation
      </h1>
      <p className="mt-3 text-sm text-stone-500">Dernière mise à jour : juillet 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-stone-700">
        <section>
          <h2 className="text-xl font-bold">1. Objet de la plateforme</h2>
          <p className="mt-2">
            Bara est une plateforme de mise en relation entre des personnes
            proposant leurs services (candidats) et des personnes ou
            structures cherchant à recruter (recruteurs). Bara n&apos;est ni
            employeur, ni agence d&apos;intérim : la relation de travail se
            conclut directement entre le candidat et le recruteur.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">2. Inscription et vérification</h2>
          <p className="mt-2">
            L&apos;inscription nécessite des informations exactes et une pièce
            d&apos;identité valide. Tout compte comportant de fausses
            informations pourra être suspendu ou supprimé.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">3. Comportement des utilisateurs</h2>
          <p className="mt-2">
            Les utilisateurs s&apos;engagent à publier des offres et profils
            sincères, à respecter leurs engagements pris via la plateforme et
            à adopter un comportement respectueux. Tout abus peut être signalé
            et entraîner la suspension du compte.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold">4. Responsabilité</h2>
          <p className="mt-2">
            Bara met tout en œuvre pour vérifier les identités mais ne peut
            garantir l&apos;issue des mises en relation. Les transactions et
            accords conclus entre utilisateurs relèvent de leur seule
            responsabilité.
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
