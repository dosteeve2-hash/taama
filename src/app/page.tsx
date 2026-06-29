import Link from "next/link";
import {
  BarChart3, Package, FileCheck, TrendingUp, ArrowRight,
  Factory, Wheat, Droplets, Leaf, Apple, Beef, Sparkles,
  ShieldCheck, Clock, AlertTriangle, Star, Check, Zap,
  Coffee, TreePine,
} from "lucide-react";

// ─── Données statiques ────────────────────────────────────────────────────────

const stats = [
  { value: "63%", label: "des PME africaines gèrent la production à la main", color: "var(--amber)" },
  { value: "40%", label: "de pertes non mesurées par cycle de production", color: "var(--terra2)" },
  { value: "3–4", label: "semaines pour reconstituer vos données de traçabilité", color: "var(--red)" },
];

const features = [
  {
    icon: BarChart3,
    title: "Suivi de production",
    description:
      "Créez des lots, saisissez les intrants et extrants, calculez vos rendements automatiquement. Fini les tableurs Excel perdus.",
    color: "var(--amber)",
  },
  {
    icon: Package,
    title: "Gestion des stocks",
    description:
      "Inventaire en temps réel sur chaque site. Alertes automatiques quand une matière passe sous le seuil critique.",
    color: "var(--blue)",
  },
  {
    icon: FileCheck,
    title: "Rapports conformité",
    description:
      "Générez les rapports EUDR, traçabilité fournisseur, et bilans matières en un clic — format bancaire inclus.",
    color: "var(--green)",
  },
];

const sectors = [
  { icon: Factory,  label: "Coton" },
  { icon: Coffee,   label: "Cacao" },
  { icon: TreePine, label: "Bois / Acajou" },
  { icon: Leaf,     label: "Karité" },
  { icon: Wheat,    label: "Céréales" },
  { icon: Sparkles, label: "Sésame" },
  { icon: Apple,    label: "Mangue séchée" },
  { icon: Beef,     label: "Élevage" },
  { icon: Droplets, label: "Savonnerie" },
];

const benefits = [
  { icon: TrendingUp,    text: "Rendements mesurés, pertes identifiées" },
  { icon: ShieldCheck,   text: "Conformité EUDR 2026 garantie" },
  { icon: Clock,         text: "10 min/jour pour piloter votre usine" },
  { icon: AlertTriangle, text: "Alertes stock avant la rupture" },
];

const testimonials = [
  {
    name: "Moussa Traoré",
    role: "Directeur, Mali Coton Export SARL",
    location: "Ségou, Mali",
    quote:
      "Chaque balle de coton est tracée de la récolte à l'égrenage. Nos acheteurs européens reçoivent leur rapport EUDR en 5 minutes — c'est ce qui nous a ouvert les portes du marché UE.",
    rating: 5,
    avatar: "MT",
    color: "var(--amber)",
  },
  {
    name: "Adjoua Yao Konan",
    role: "PDG, Cacao Premium CI SARL",
    location: "San-Pédro, Côte d'Ivoire",
    quote:
      "On a détecté 22% de pertes invisibles entre la fermentation et le séchage. En réajustant le process, on a récupéré ces marges en 2 cycles. TAAMA nous a donné des chiffres que personne n'avait jamais calculés.",
    rating: 5,
    avatar: "AK",
    color: "var(--terra2)",
  },
  {
    name: "Emmanuel Nkoa",
    role: "Gérant, Bois & Acajou Industries",
    location: "Douala, Cameroun",
    quote:
      "La traçabilité EUDR sur le bois, c'était notre plus grand défi. Maintenant, chaque grume a son code lot et son origine GPS. Le certificat sort automatiquement — zéro retard à l'export.",
    rating: 5,
    avatar: "EN",
    color: "var(--green)",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "15 000",
    period: "FCFA / mois",
    description: "Pour démarrer la traçabilité",
    color: "var(--blue)",
    features: [
      "1 site de production",
      "Jusqu'à 50 lots / mois",
      "Gestion stock basique",
      "Rapports PDF",
      "Support email",
    ],
    cta: "Commencer gratuit",
    highlighted: false,
  },
  {
    name: "PME",
    price: "45 000",
    period: "FCFA / mois",
    description: "Pour les PME en croissance",
    color: "var(--amber)",
    features: [
      "3 sites de production",
      "Lots illimités",
      "Graphiques & analytics",
      "Conformité EUDR complète",
      "Alertes intelligentes",
      "Support prioritaire",
    ],
    cta: "Essai 30 jours gratuit",
    highlighted: true,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    period: "",
    description: "Pour les groupes industriels",
    color: "var(--terra2)",
    features: [
      "Sites illimités",
      "API & intégrations ERP",
      "Tableau de bord multi-sites",
      "Rapports bancaires & export",
      "Formation équipe incluse",
      "Account manager dédié",
    ],
    cta: "Nous contacter",
    highlighted: false,
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(13, 17, 23, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "var(--amber)", color: "var(--bg)" }}
          >
            T
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text)", fontFamily: "monospace" }}>
            TAAMA
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {["Fonctionnalités", "Secteurs", "Tarifs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm transition-colors"
              style={{ color: "var(--text2)" }}
            >
              {item}
            </a>
          ))}
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
            href="/inscription"
            className="text-sm px-4 py-2 rounded-lg font-semibold transition-all taama-btn-primary"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden grain-bg"
        style={{ minHeight: "100vh" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(240,168,50,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 animate-fade-in"
          style={{
            background: "rgba(240,168,50,0.1)",
            border: "1px solid rgba(240,168,50,0.3)",
            color: "var(--amber)",
          }}
        >
          <Sparkles size={12} />
          Conçu pour les industries africaines
        </div>

        {/* Titre */}
        <h1
          className="font-black mb-6 animate-fade-in"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            animationDelay: "0.1s",
          }}
        >
          <span className="taama-gradient-text">TAAMA</span>
        </h1>

        <p
          className="text-xl md:text-2xl max-w-2xl mb-4 animate-fade-in"
          style={{ color: "var(--text2)", lineHeight: 1.5, animationDelay: "0.2s" }}
        >
          Pilotez votre chaîne de transformation.
        </p>
        <p
          className="text-lg md:text-xl max-w-xl mb-10 animate-fade-in"
          style={{ color: "var(--text3)", animationDelay: "0.25s" }}
        >
          Du champ à l&apos;usine, de l&apos;usine au marché.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/inscription"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base taama-btn-primary"
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-colors"
            style={{ border: "1px solid var(--border2)", color: "var(--text2)" }}
          >
            Voir la démo
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div
          className="mt-20 w-full max-w-4xl rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border2)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,168,50,0.05)",
            animationDelay: "0.4s",
          }}
        >
          {/* Barre de titre mockup */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--red)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--amber)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "var(--green)" }} />
            <span className="ml-4 text-xs" style={{ color: "var(--text3)", fontFamily: "monospace" }}>
              taama.io/dashboard
            </span>
          </div>
          {/* Contenu mockup */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Lots en cours", value: "12", color: "var(--blue)" },
              { label: "Rendement moyen", value: "87%", color: "var(--green)" },
              { label: "Alertes stock", value: "3", color: "var(--amber)" },
              { label: "Tonnes ce mois", value: "142t", color: "var(--terra2)" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl p-4"
                style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs mb-2" style={{ color: "var(--text3)" }}>{kpi.label}</div>
                <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6">
            <div
              className="rounded-xl p-4 h-24 flex items-end gap-1"
              style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}
            >
              {[60, 75, 55, 90, 80, 95, 70, 85, 88, 72, 91, 87].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === 11
                      ? "var(--amber)"
                      : `rgba(240,168,50,${0.3 + i * 0.03})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS CHOCS ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-5xl font-black mb-3"
                style={{ color: stat.color, fontFamily: "monospace" }}
              >
                {stat.value}
              </div>
              <p className="text-sm" style={{ color: "var(--text2)", lineHeight: 1.6 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="fonctionnalités" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--text)" }}
            >
              Tout ce dont votre usine a besoin
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Conçu pour des opérateurs terrain, pas pour des consultants ERP.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="taama-card p-6 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bénéfices rapides */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
              >
                <b.icon size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
                <span className="text-xs" style={{ color: "var(--text2)" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTEURS ────────────────────────────────────────────────────────── */}
      <section
        id="secteurs"
        className="px-6 py-24"
        style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              Pour votre secteur
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Coton, cacao, bois, karité, sésame — TAAMA s&apos;adapte à chaque filière de transformation en Afrique de l&apos;Ouest et Centrale.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sectors.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all cursor-default hover:border-amber-500"
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                }}
              >
                <s.icon size={16} style={{ color: "var(--amber)" }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ─────────────────────────────────────────────────────── */}
      <section
        id="témoignages"
        className="px-6 py-24"
        style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              Ce que disent nos utilisateurs
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Du Mali à la Côte d&apos;Ivoire, du Cameroun au Burkina Faso — des PME africaines qui ont transformé leur gestion avec TAAMA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="taama-card p-6 flex flex-col gap-4">
                {/* Étoiles */}
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: "var(--amber)", fill: "var(--amber)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text2)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `${t.color}20`, color: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>
                      {t.role} · {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="tarifs" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              Tarifs transparents
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Sans engagement. Sans surprise. Adapté à la réalité des PME africaines.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="taama-card p-6 flex flex-col gap-5 relative"
                style={
                  plan.highlighted
                    ? { border: `1px solid ${plan.color}50`, boxShadow: `0 0 32px ${plan.color}10` }
                    : {}
                }
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={{ background: plan.color, color: "var(--bg)" }}
                  >
                    <Zap size={11} /> Populaire
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: plan.color }}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black" style={{ color: "var(--text)" }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm" style={{ color: "var(--text3)" }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
                    {plan.description}
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--text2)" }}>
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.highlighted ? "/inscription" : "#"}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlighted ? "taama-btn-primary" : ""
                  }`}
                  style={
                    !plan.highlighted
                      ? { border: "1px solid var(--border2)", color: "var(--text2)" }
                      : {}
                  }
                >
                  {plan.cta}
                  {plan.highlighted && <ArrowRight size={16} />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(240,168,50,0.1)",
              border: "1px solid rgba(240,168,50,0.2)",
              color: "var(--amber2)",
            }}
          >
            30 jours d&apos;essai gratuit — sans carte bancaire
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "var(--text)" }}>
            Prêt à piloter votre production ?
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--text2)" }}>
            Rejoignez les premières PME africaines qui mesurent vraiment leurs rendements.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base taama-btn-primary"
          >
            Démarrer gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
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
          <span>Conçu par Steeve Donald Compaoré</span>
        </div>
      </footer>

    </div>
  );
}
