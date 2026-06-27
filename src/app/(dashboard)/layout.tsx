'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  LayoutDashboard, Factory, Package, GitBranch,
  BarChart3, Settings, LogOut, Bell, BookOpen, Menu, X,
} from 'lucide-react';
import { deconnexionAction } from '@/app/(auth)/actions';

// ─── Navigation items ─────────────────────────────────────────────────────────
const navItems = [
  { href: '/dashboard',   label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { href: '/production',  label: 'Production',      icon: Factory },
  { href: '/inventaire',  label: 'Inventaire',      icon: Package },
  { href: '/catalogue',   label: 'Catalogue',       icon: BookOpen },
  { href: '/tracabilite', label: 'Traçabilité',      icon: GitBranch },
  { href: '/rapports',    label: 'Rapports',         icon: BarChart3 },
];

// ─── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await deconnexionAction();
    });
  };

  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
          style={{ background: 'var(--amber)', color: 'var(--bg)' }}
        >
          T
        </div>
        <div>
          <div className="font-bold text-base" style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
            TAAMA
          </div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>Production</div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(240,168,50,0.12)' : 'transparent',
                color: isActive ? 'var(--amber)' : 'var(--text2)',
                borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Section bas de sidebar */}
      <div
        className="px-3 py-4 flex flex-col gap-1"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link
          href="/parametres"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--text2)' }}
        >
          <Settings size={17} />
          Paramètres
        </Link>

        {/* Avatar + déconnexion */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--amber)', color: 'var(--bg)' }}
          >
            SD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>Mon espace</div>
            <div className="text-xs truncate" style={{ color: 'var(--text3)' }}>Admin</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex-shrink-0 transition-colors disabled:opacity-50"
            style={{ color: 'var(--text3)' }}
            title="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  const fermerSidebar = () => setSidebarOuverte(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Sidebar desktop (fixe, toujours visible ≥ md) ── */}
      <aside
        className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 z-40"
        style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Overlay mobile (fond sombre quand sidebar ouverte) ── */}
      {sidebarOuverte && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={fermerSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar mobile (drawer) ── */}
      <aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col w-64 md:hidden transition-transform duration-300"
        style={{
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          transform: sidebarOuverte ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={fermerSidebar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ color: 'var(--text3)', border: '1px solid var(--border2)' }}
          aria-label="Fermer le menu"
        >
          <X size={15} />
        </button>
        <SidebarContent onLinkClick={fermerSidebar} />
      </aside>

      {/* ── Contenu principal ── */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Header fixe — logo + hamburger mobile / cloche desktop */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4"
          style={{
            background: 'rgba(13,17,23,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Mobile : logo TAAMA + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setSidebarOuverte(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
              aria-label="Ouvrir le menu"
            >
              <Menu size={16} />
            </button>
            <div className="font-bold text-sm" style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
              TAAMA
            </div>
          </div>

          {/* Desktop : espace vide à gauche */}
          <div className="hidden md:block" />

          {/* Bouton cloche alertes */}
          <div className="flex items-center gap-3">
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
              aria-label="Alertes"
            >
              <Bell size={16} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-amber"
                style={{ background: 'var(--amber)' }}
              />
            </button>
          </div>
        </header>

        {/* Contenu de la page */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
