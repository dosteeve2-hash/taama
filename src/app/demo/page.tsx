"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Star, Check, ArrowRight, CheckCircle,
  Sparkles, Leaf, Factory, Coffee,
} from "lucide-react";
import { soumettreDemandeDemo, type DemoFormData } from "./actions";

// ─── Témoignages (repris de la landing) ──────────────────────────────────────

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

const demoPoints = [
  {
    icon: Factory,
    text: "Configurez votre premier lot de production en 5 minutes",
    color: "var(--amber)",
  },
  {
    icon: Leaf,
    text: "Générez un rapport EUDR complet avec vos données réelles",
    color: "var(--green)",
  },
  {
    icon: Coffee,
    text: "Activez les alertes stock adaptées à votre filière",
    color: "var(--terra2)",
  },
];

const guarantees = [
  "Démonstration personnalisée selon votre filière",
  "Aucun engagement — résiliez à tout moment",
  "Onboarding accompagné par notre équipe",
  "Données hébergées en Europe (RGPD)",
];

// ─── Styles partagés pour les champs ─────────────────────────────────────────

const fieldStyle = {
  background: "var(--bg3)",
  border: "1px solid var(--border2)",
  color: "var(--text)",
} as const;

const labelStyle = {
  color: "var(--text2)",
} as const;

// ─── Composant principal ──────────────────────────────────────────────────────

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<DemoFormData>({
    prenom: "",
    nom: "",
    email: "",
    entreprise: "",
    filiere: "",
    nbEmployes: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await soumettreDemandeDemo(form);
      if (result.success) {
        setSuccess(true);
      } else {
        setErrorMsg(result.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setSuccess(false);
    setErrorMsg(null);
    setForm({
      prenom: "",
      nom: "",
      email: "",
      entreprise: "",
      filiere: "",
      nbEmployes: "",
      message: "",
    });
  }

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
          <Link href="/pricing" className="text-sm transition-colors" style={{ color: "var(--text2)" }}>
            Tarifs
          </Link>
          <Link href="/demo" className="text-sm font-medium transition-colors" style={{ color: "var(--amber)" }}>
            Démo
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
            href="/inscription"
            className="text-sm px-4 py-2 rounded-lg font-semibold transition-all taama-btn-primary"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(240,168,50,0.1)",
              border: "1px solid rgba(240,168,50,0.3)",
              color: "var(--amber)",
            }}
          >
            <Sparkles size={12} />
            ✓ Réponse sous 24h · ✓ Sans engagement · ✓ Adapté à votre filière
          </div>
          <h1
            className="font-black mb-5"
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            Demandez une{" "}
            <span className="taama-gradient-text">démo gratuite</span>
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: "var(--text2)", lineHeight: 1.6 }}
          >
            Découvrez comment TAAMA aide votre PME à être conforme EUDR en 30 minutes.
          </p>
        </div>
      </section>

      {/* ── FORMULAIRE + AVANTAGES ────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── FORMULAIRE ──────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border2)",
              boxShadow: "0 0 48px rgba(240,168,50,0.04)",
            }}
          >
            {success ? (
              // ── État de confirmation ─────────────────────────────────
              <div className="flex flex-col items-center text-center py-10 gap-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(63,185,80,0.1)",
                    border: "1px solid rgba(63,185,80,0.3)",
                  }}
                >
                  <CheckCircle size={32} style={{ color: "var(--green)" }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    Demande envoyée !
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                    Merci {form.prenom}&nbsp;! Notre équipe vous recontactera sous 24h pour planifier
                    votre démo personnalisée sur la filière {form.filiere}.
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    color: "var(--text3)",
                  }}
                >
                  ✓ Confirmé · {form.email}
                </div>
                <button
                  onClick={resetForm}
                  className="text-sm transition-colors"
                  style={{ color: "var(--text3)" }}
                >
                  Soumettre une autre demande
                </button>
              </div>
            ) : (
              // ── Formulaire ─────────────────────────────────────────
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>
                    Vos informations
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text3)" }}>
                    Notre équipe vous contacte sous 24h.
                  </p>
                </div>

                {/* Prénom + Nom */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Prénom <span style={{ color: "var(--amber)" }}>*</span>
                    </label>
                    <input
                      name="prenom"
                      type="text"
                      required
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Moussa"
                      className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                      style={fieldStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Nom <span style={{ color: "var(--amber)" }}>*</span>
                    </label>
                    <input
                      name="nom"
                      type="text"
                      required
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Traoré"
                      className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {/* Email professionnel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Email professionnel <span style={{ color: "var(--amber)" }}>*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="moussa@entreprise.com"
                    className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                    style={fieldStyle}
                  />
                </div>

                {/* Entreprise */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Nom de l&apos;entreprise <span style={{ color: "var(--amber)" }}>*</span>
                  </label>
                  <input
                    name="entreprise"
                    type="text"
                    required
                    value={form.entreprise}
                    onChange={handleChange}
                    placeholder="Mali Coton Export SARL"
                    className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                    style={fieldStyle}
                  />
                </div>

                {/* Filière + Employés */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Filière <span style={{ color: "var(--amber)" }}>*</span>
                    </label>
                    <select
                      name="filiere"
                      required
                      value={form.filiere}
                      onChange={handleChange}
                      className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                      style={{
                        ...fieldStyle,
                        color: form.filiere ? "var(--text)" : "var(--text3)",
                      }}
                    >
                      <option value="" disabled>Choisir...</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Café">Café</option>
                      <option value="Coton">Coton</option>
                      <option value="Bois">Bois</option>
                      <option value="Caoutchouc">Caoutchouc</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Employés <span style={{ color: "var(--amber)" }}>*</span>
                    </label>
                    <select
                      name="nbEmployes"
                      required
                      value={form.nbEmployes}
                      onChange={handleChange}
                      className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                      style={{
                        ...fieldStyle,
                        color: form.nbEmployes ? "var(--text)" : "var(--text3)",
                      }}
                    >
                      <option value="" disabled>Choisir...</option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>
                </div>

                {/* Message optionnel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Message <span style={{ color: "var(--text3)" }}>(optionnel)</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Dites-nous en plus sur vos besoins spécifiques..."
                    rows={3}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none resize-none w-full"
                    style={fieldStyle}
                  />
                </div>

                {/* Message d'erreur */}
                {errorMsg && (
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(248,81,73,0.1)",
                      border: "1px solid rgba(248,81,73,0.3)",
                      color: "var(--red)",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {/* Bouton submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all taama-btn-primary"
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                        style={{ animation: "spin 0.7s linear infinite" }}
                      />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Demander ma démo
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-xs text-center" style={{ color: "var(--text3)" }}>
                  En soumettant ce formulaire, vous acceptez d&apos;être contacté par notre équipe.
                  <br />
                  Aucune carte bancaire requise.
                </p>
              </form>
            )}
          </div>

          {/* ── AVANTAGES ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8 justify-center">

            {/* Ce que vous allez découvrir */}
            <div>
              <h3 className="text-lg font-bold mb-5" style={{ color: "var(--text)" }}>
                Ce que vous allez découvrir
              </h3>
              <div className="flex flex-col gap-4">
                {demoPoints.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}30`,
                      }}
                    >
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <p className="text-sm leading-relaxed pt-1" style={{ color: "var(--text2)" }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge EUDR Ready */}
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: "rgba(63,185,80,0.06)",
                border: "1px solid rgba(63,185,80,0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{
                  background: "rgba(63,185,80,0.15)",
                  color: "var(--green)",
                }}
              >
                ✓
              </div>
              <div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--green)" }}>
                  EUDR Ready
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text3)" }}>
                  Conforme aux exigences EUDR en vigueur depuis décembre 2024.
                  Traçabilité complète de l&apos;origine à l&apos;export.
                </p>
              </div>
            </div>

            {/* Garanties */}
            <div className="flex flex-col gap-3">
              {guarantees.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <Check size={15} style={{ color: "var(--amber)", flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: "var(--text2)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ───────────────────────────────────────────────────── */}
      <section
        className="px-6 py-24"
        style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>
              Ils ont déjà adopté TAAMA
            </h2>
            <p style={{ color: "var(--text2)" }}>
              Du Mali à la Côte d&apos;Ivoire, du Cameroun au Burkina Faso — des PME qui ont transformé
              leur gestion avec TAAMA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="taama-card p-6 flex flex-col gap-4">
                {/* Étoiles */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      style={{ color: "var(--amber)", fill: "var(--amber)" }}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text2)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div
                  className="flex items-center gap-3 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
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
