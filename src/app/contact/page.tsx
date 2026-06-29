"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  Mail, MessageCircle, Send, CheckCircle,
  ArrowRight, Sparkles, Phone,
} from "lucide-react";

function LinkedinIcon({ size = 20, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ─── Styles partagés ──────────────────────────────────────────────────────────

const fieldStyle = {
  background: "var(--bg3)",
  border: "1px solid var(--border2)",
  color: "var(--text)",
} as const;

const labelStyle = {
  color: "var(--text2)",
} as const;

// ─── Canaux de contact ────────────────────────────────────────────────────────

const channels = [
  {
    icon: Mail,
    title: "Email",
    subtitle: "Réponse sous 24h",
    value: "contact@taama.africa",
    href: "mailto:contact@taama.africa",
    color: "var(--amber)",
    bg: "rgba(240,168,50,0.08)",
    border: "rgba(240,168,50,0.2)",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    subtitle: "Disponible 8h–18h (UTC+0)",
    value: "+226 70 00 00 00",
    href: "https://wa.me/22670000000",
    color: "var(--green)",
    bg: "rgba(63,185,80,0.08)",
    border: "rgba(63,185,80,0.2)",
  },
  {
    icon: LinkedinIcon,
    title: "LinkedIn",
    subtitle: "Suivez TAAMA & FORGE Afrika",
    value: "Steeve Donald Compaoré",
    href: "https://www.linkedin.com/in/steeve-donald-compaore",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.08)",
    border: "rgba(10,102,194,0.2)",
  },
];

// ─── Types formulaire ─────────────────────────────────────────────────────────

interface ContactFormData {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  filiere: string;
  telephone: string;
  message: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(false);

  const [form, setForm] = useState<ContactFormData>({
    prenom: "",
    nom: "",
    email: "",
    entreprise: "",
    filiere: "",
    telephone: "",
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

    // Simulate async submission
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("[TAAMA Contact] Nouveau message reçu :", form);

    setIsLoading(false);
    setSuccess(true);
    setToast(true);

    // Hide toast after 4 seconds
    setTimeout(() => setToast(false), 4000);
  }

  function resetForm() {
    setSuccess(false);
    setForm({
      prenom: "",
      nom: "",
      email: "",
      entreprise: "",
      filiere: "",
      telephone: "",
      message: "",
    });
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium"
          style={{
            background: "rgba(63,185,80,0.12)",
            border: "1px solid rgba(63,185,80,0.4)",
            color: "var(--green)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <CheckCircle size={17} />
          Message envoyé !
        </div>
      )}

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
          <Link href="/demo" className="text-sm transition-colors" style={{ color: "var(--text2)" }}>
            Démo
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors" style={{ color: "var(--amber)" }}>
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
            Support · Partenariat · Presse
          </div>
          <h1
            className="font-black mb-5"
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            Parlons de votre{" "}
            <span className="taama-gradient-text">conformité EUDR</span>
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: "var(--text2)", lineHeight: 1.6 }}
          >
            Notre équipe répond à toutes vos demandes — démo, support technique, partenariat ou presse.
          </p>
        </div>
      </section>

      {/* ── CANAUX DE CONTACT ────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {channels.map(({ icon: Icon, title, subtitle, value, href, color, bg, border }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-4 p-6 rounded-2xl transition-all"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border2)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className="font-semibold text-base mb-0.5" style={{ color: "var(--text)" }}>
                  {title}
                </div>
                <div className="text-xs mb-2" style={{ color: "var(--text3)" }}>
                  {subtitle}
                </div>
                <div
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color }}
                >
                  {value}
                  <ArrowRight size={13} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FORMULAIRE ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border2)",
              boxShadow: "0 0 48px rgba(240,168,50,0.04)",
            }}
          >
            {success ? (
              // ── Confirmation ───────────────────────────────────────────
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
                    Message envoyé !
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                    Merci {form.prenom}&nbsp;! Notre équipe vous répondra sous 24h à{" "}
                    <span style={{ color: "var(--amber)" }}>{form.email}</span>.
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
                  ✓ Message reçu · {form.email}
                </div>
                <button
                  onClick={resetForm}
                  className="text-sm transition-colors"
                  style={{ color: "var(--text3)" }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              // ── Formulaire ─────────────────────────────────────────────
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>
                    Envoyez-nous un message
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text3)" }}>
                    Support, partenariat, presse ou toute autre demande.
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

                {/* Email */}
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
                    Entreprise
                  </label>
                  <input
                    name="entreprise"
                    type="text"
                    value={form.entreprise}
                    onChange={handleChange}
                    placeholder="Mali Coton Export SARL"
                    className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                    style={fieldStyle}
                  />
                </div>

                {/* Filière + Téléphone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Filière
                    </label>
                    <select
                      name="filiere"
                      value={form.filiere}
                      onChange={handleChange}
                      className="px-3 py-2.5 rounded-xl text-sm outline-none w-full"
                      style={{
                        ...fieldStyle,
                        color: form.filiere ? "var(--text)" : "var(--text3)",
                      }}
                    >
                      <option value="">Choisir...</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Café">Café</option>
                      <option value="Coton">Coton</option>
                      <option value="Bois">Bois</option>
                      <option value="Caoutchouc">Caoutchouc</option>
                      <option value="Karité">Karité</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={labelStyle}>
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text3)" }}
                      />
                      <input
                        name="telephone"
                        type="tel"
                        value={form.telephone}
                        onChange={handleChange}
                        placeholder="+226 70 00 00 00"
                        className="pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none w-full"
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Message <span style={{ color: "var(--amber)" }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre demande (support, partenariat, information sur la conformité EUDR…)"
                    className="px-3 py-2.5 rounded-xl text-sm outline-none w-full resize-none"
                    style={fieldStyle}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all taama-btn-primary disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: "rgba(13,17,23,0.3)", borderTopColor: "var(--bg)" }}
                      />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-8 text-center text-xs"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text3)" }}
      >
        © {new Date().getFullYear()} TAAMA — FORGE Afrika · Ouagadougou, Burkina Faso ·{" "}
        <a href="mailto:contact@taama.africa" style={{ color: "var(--amber)" }}>
          contact@taama.africa
        </a>
      </footer>
    </div>
  );
}
