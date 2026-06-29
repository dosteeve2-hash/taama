import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight, Zap, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs — TAAMA",
  description:
    "Plans tarifaires TAAMA pour PME africaines de traçabilité agricole. Starter 25 000 FCFA, Pro 75 000 FCFA, Enterprise sur devis.",
};

// ─── Données ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter",
    price: "25 000",
    period: "FCFA / mois",
    description: "Pour démarrer la traçabilité",
    color: "var(--blue)",
    highlighted: false,
    cta: "Démarrer l'essai gratuit",
    ctaHref: "/auth/register",
    features: [
      "Jusqu'à 5 utilisateurs",
      "Traçabilité de base (scan QR)",
      "1 filière / produit",
      "Support email",
    ],
  },
  {
    name: "Pro",
    price: "75 000",
    period: "FCFA / mois",
    description: "Pour les PME en croissance",
    color: "var(--amber)",
    highlighted: true,
    cta: "Démarrer l'essai gratuit",
    ctaHref: "/auth/register",
    features: [
      "Jusqu'à 25 utilisateurs",
      "Traçabilité complète + rapports EUDR",
      "5 filières / produits",
      "Intégration CompTrack",
      "Support prioritaire",
    ],
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    description: "Pour les groupes industriels",
    color: "var(--terra2)",
    highlighted: false,
    cta: "Nous contacter",
    ctaHref: "mailto:contact@taama.africa",
    features: [
      "Utilisateurs illimités",
      "API personnalisée",
      "Conformité EUDR garantie",
      "Intégration ERP / SAP",
      "Account manager dédié",
    ],
  },
];

const faqs = [
  {
    q: "L'essai gratuit est-il vraiment sans carte bancaire ?",
    a: "Oui. 14 jours d'essai complet, sans carte bancaire ni engagement. Vous accédez à toutes les fonctionnalités du plan Pro pendant la période d'essai.",
  },
  {
    q: "Comment se passe la migration de mes données existantes ?",
    a: "Notre équipe vous accompagne dans l'import de vos données (Excel, CSV, fichiers papier numérisés). La migration est incluse dans tous les plans payants et se fait généralement en moins de 48 h.",
  },
  {
    q: "La conformité EUDR est-elle incluse dans tous les plans ?",
    a: "Les rapports de conformité EUDR de base sont disponibles dès le plan Starter. La conformité complète avec certification et audit trail est disponible à partir du plan Pro, et garantie contractuellement dans le plan Enterprise.",
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(13, 17, 23, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "var(--amber)", color: "var(--bg)" }}
          >
            T
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text)", fontFamily: "monospace" }}>
            TAAMA
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#fonctionnalités" className="text-sm transition-colors" style={{ color: "var(--text2)" }}>
            Fonctionnalités
          </Link>
          <Link href="/#secteurs" className="text-sm transition-colors" style={{ color: "var(--text2)" }}>
            Secteurs
          </Link>
          <Link href="/pricing" className="text-sm transition-colors" style={{ color: "var(--amber)" }}>
            Tarifs
          </Link>
          <Link href="/demo" className="text-sm font-medium transition-colors" style={{ color: "var(--text2)" }}>
            Démo
          </Link>
          <Link href="/contact" className="text-sm transition-colors" style={{ color: "var(--text2)" }}>
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ color: "var(--text2)", border: "1px solid var(--border2)" }}
          >
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="text-sm px-4 py-2 rounded-lg font-semibold transition-all taama-btn-primary"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(240,168,50,0.1)",
              border: "1px solid rgba(240,168,50,0.3)",
              color: "var(--amber)",
            }}
          >
            14 jours d&apos;essai gratuit · Sans carte bancaire
          </div>
          <h1
            className="font-black mb-5"
            style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", lineHeight: 1.1, color: "var(--text)" }}
          >
            Des tarifs pensés pour{" "}
            <span className="taama-gradient-text">les PME africaines</span>
          </h1>
          <p className="text-lg" style={{ color: "var(--text2)", lineHeight: 1.6 }}>
            Tracez votre filière, produisez vos rapports EUDR, pilotez vos stocks.
            Choisissez le plan qui correspond à votre taille.
          </p>
        </div>
      </section>

      {/* ── PLANS ─────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="taama-card p-7 flex flex-col gap-5 relative"
              style={
                plan.highlighted
                  ? {
                      border: "1px solid rgba(240,168,50,0.4)",
                      boxShadow: "0 0 40px rgba(240,168,50,0.08)",
                    }
                  : {}
              }
            >
              {/* Badge Recommandé */}
              {plan.highlighted && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                  style={{ background: "var(--amber)", color: "var(--bg)" }}
                >
                  <Zap size={11} />
                  Recommandé
                </div>
              )}

              {/* Header du plan */}
              <div>
                <div className="font-semibold text-sm mb-2" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black" style={{ color: "var(--text)" }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: "var(--text3)" }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text3)" }}>
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text2)" }}>
                    <Check size={15} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.name === "Enterprise" ? (
                <a
                  href={plan.ctaHref}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: "1px solid var(--terra2)", color: "var(--terra2)" }}
                >
                  <Mail size={15} />
                  {plan.cta}
                </a>
              ) : plan.highlighted ? (
                <Link
                  href={plan.ctaHref}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all taama-btn-primary"
                >
                  {plan.cta}
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: "1px solid var(--border2)", color: "var(--text2)" }}
                >
                  {plan.cta}
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-24"
        style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>
              Questions fréquentes
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Tout ce que vous devez savoir avant de commencer.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)" }}
              >
                <h3 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm mb-4" style={{ color: "var(--text3)" }}>
              Vous avez d&apos;autres questions ?
            </p>
            <a
              href="mailto:contact@taama.africa"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--amber)" }}
            >
              <Mail size={15} />
              contact@taama.africa
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-12 text-center"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold mx-auto mb-4"
          style={{ background: "var(--amber)", color: "var(--bg)" }}
        >
          T
        </div>
        <p className="font-semibold text-lg mb-2" style={{ color: "var(--text)" }}>TAAMA</p>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text3)", lineHeight: 1.7 }}>
          En Mooré, <em>taama</em> signifie le voyage, la progression.
          <br />
          Votre matière première a une histoire — racontez-la.
        </p>
        <div className="mt-8 flex justify-center gap-6 text-xs" style={{ color: "var(--text3)" }}>
          <span>© 2026 TAAMA</span>
          <span>•</span>
          <span>Ouagadougou, Burkina Faso</span>
          <span>•</span>
          <Link href="/" style={{ color: "var(--text3)" }}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </footer>

    </div>
  );
}
