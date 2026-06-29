'use client';

import { useState, useTransition, useMemo } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, BookOpen, Truck } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { useDebounce } from '@/hooks/useDebounce';
import { ajouterMatiere, supprimerMatiere, ajouterFournisseur, supprimerFournisseur } from './actions';
import type { Material, Supplier } from '@/types/database';

interface Props {
  materials: Material[];
  suppliers: Supplier[];
  orgId: string;
}

const labelCategorie: Record<string, { label: string; color: string; bg: string }> = {
  raw:      { label: 'Matière première', color: 'var(--amber)',  bg: 'rgba(240,168,50,0.1)' },
  finished: { label: 'Produit fini',     color: 'var(--green)',  bg: 'rgba(63,185,80,0.1)' },
  byproduct:{ label: 'Sous-produit',     color: 'var(--blue)',   bg: 'rgba(88,166,255,0.1)' },
};

// ─── Formulaire ajout matière ─────────────────────────────────────────────────
function FormulaireMatiere({ orgId, onSuccess }: { orgId: string; onSuccess: () => void }) {
  const [name, setName]         = useState('');
  const [unit, setUnit]         = useState('kg');
  const [category, setCategory] = useState<'raw' | 'finished' | 'byproduct'>('raw');
  const [description, setDesc]  = useState('');
  const [erreur, setErreur]     = useState<string | null>(null);
  const [isPending, start]      = useTransition();

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    start(async () => {
      const result = await ajouterMatiere({ orgId, name, unit, category, description: description || undefined });
      if (!result.success) { setErreur(result.error); }
      else { setName(''); setUnit('kg'); setCategory('raw'); setDesc(''); onSuccess(); }
    });
  };

  const inputStyle = { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)' };
  const cls = 'px-3 py-2.5 rounded-xl text-sm outline-none transition-all';

  return (
    <form onSubmit={soumettre} className="p-4 rounded-xl flex flex-col gap-3"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
      <div className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Nouvelle matière / produit</div>
      {erreur && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-lg"
          style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}>
          <AlertCircle size={13} /> {erreur}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nom *" required className={`col-span-2 w-full ${cls}`} style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor='var(--amber)')}
          onBlur={(e) => (e.target.style.borderColor='var(--border2)')} />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}
          className={`w-full ${cls}`} style={{ ...inputStyle, cursor: 'pointer' }}>
          {['kg', 'tonne', 'litre', 'sac', 'caisse', 'unité'].map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as 'raw' | 'finished' | 'byproduct')}
          className={`w-full ${cls}`} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="raw">Matière première</option>
          <option value="finished">Produit fini</option>
          <option value="byproduct">Sous-produit</option>
        </select>
        <input type="text" value={description} onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optionnel)" className={`col-span-2 w-full ${cls}`} style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor='var(--amber)')}
          onBlur={(e) => (e.target.style.borderColor='var(--border2)')} />
      </div>
      <button type="submit" disabled={isPending}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 taama-btn-primary">
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Ajouter
      </button>
    </form>
  );
}

// ─── Formulaire ajout fournisseur ─────────────────────────────────────────────
function FormulaireFournisseur({ orgId, onSuccess }: { orgId: string; onSuccess: () => void }) {
  const [name, setName]         = useState('');
  const [contact, setContact]   = useState('');
  const [location, setLocation] = useState('');
  const [erreur, setErreur]     = useState<string | null>(null);
  const [isPending, start]      = useTransition();

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    start(async () => {
      const result = await ajouterFournisseur({ orgId, name, contact: contact || undefined, location: location || undefined });
      if (!result.success) { setErreur(result.error); }
      else { setName(''); setContact(''); setLocation(''); onSuccess(); }
    });
  };

  const inputStyle = { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)' };
  const cls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all';

  return (
    <form onSubmit={soumettre} className="p-4 rounded-xl flex flex-col gap-3"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
      <div className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Nouveau fournisseur</div>
      {erreur && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-lg"
          style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}>
          <AlertCircle size={13} /> {erreur}
        </div>
      )}
      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Nom du fournisseur *" required className={cls} style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor='var(--amber)')}
        onBlur={(e) => (e.target.style.borderColor='var(--border2)')} />
      <input type="text" value={contact} onChange={(e) => setContact(e.target.value)}
        placeholder="Contact (téléphone, email…)" className={cls} style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor='var(--amber)')}
        onBlur={(e) => (e.target.style.borderColor='var(--border2)')} />
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
        placeholder="Localisation" className={cls} style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor='var(--amber)')}
        onBlur={(e) => (e.target.style.borderColor='var(--border2)')} />
      <button type="submit" disabled={isPending}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 taama-btn-primary">
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Ajouter
      </button>
    </form>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CatalogueClient({ materials, suppliers, orgId }: Props) {
  const [onglet, setOnglet] = useState<'matieres' | 'fournisseurs'>('matieres');
  const [isPendingDel, startDel] = useTransition();
  const [erreurDel, setErreurDel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filtrage des matières par recherche
  const filteredMaterials = useMemo(() => {
    if (!debouncedSearch.trim()) return materials;
    const q = debouncedSearch.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q)
    );
  }, [materials, debouncedSearch]);

  // Filtrage des fournisseurs par recherche
  const filteredSuppliers = useMemo(() => {
    if (!debouncedSearch.trim()) return suppliers;
    const q = debouncedSearch.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.contact ?? '').toLowerCase().includes(q) ||
        (s.location ?? '').toLowerCase().includes(q)
    );
  }, [suppliers, debouncedSearch]);

  const supprimerM = (id: string) => {
    if (!confirm('Supprimer cette matière ?')) return;
    startDel(async () => {
      const r = await supprimerMatiere(id);
      if (!r.success) setErreurDel(r.error);
    });
  };

  const supprimerF = (id: string) => {
    if (!confirm('Supprimer ce fournisseur ?')) return;
    startDel(async () => {
      const r = await supprimerFournisseur(id);
      if (!r.success) setErreurDel(r.error);
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Catalogue</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Matières premières, produits finis et fournisseurs
        </p>
      </div>

      {erreurDel && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--red)' }}>
          <AlertCircle size={15} /> {erreurDel}
        </div>
      )}

      {/* Barre de recherche */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={onglet === 'matieres' ? 'Rechercher une matière…' : 'Rechercher un fournisseur…'}
        resultCount={
          searchQuery
            ? onglet === 'matieres'
              ? filteredMaterials.length
              : filteredSuppliers.length
            : undefined
        }
        className="max-w-sm"
      />

      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg3)' }}>
        {([['matieres', 'Matières & Produits', BookOpen], ['fournisseurs', 'Fournisseurs', Truck]] as [string, string, React.ElementType][]).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setOnglet(id as 'matieres' | 'fournisseurs')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: onglet === id ? 'var(--bg2)' : 'transparent',
              color: onglet === id ? 'var(--text)' : 'var(--text3)',
              border: onglet === id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Onglet Matières */}
      {onglet === 'matieres' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tableau */}
          <div className="lg:col-span-2 taama-card overflow-hidden">
            {filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen size={28} style={{ color: 'var(--text3)' }} />
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  {debouncedSearch ? 'Aucune matière trouvée.' : 'Aucune matière dans le catalogue.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Nom', 'Unité', 'Catégorie', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                          style={{ color: 'var(--text3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m, i) => {
                      const cat = labelCategorie[m.category];
                      return (
                        <tr key={m.id}
                          style={{ borderBottom: i < filteredMaterials.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>
                            {m.name}
                            {m.description && (
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{m.description}</div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text2)' }}>{m.unit}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ background: cat?.bg ?? 'var(--bg3)', color: cat?.color ?? 'var(--text2)' }}>
                              {cat?.label ?? m.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => supprimerM(m.id)} disabled={isPendingDel}
                              className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ color: 'var(--text3)' }}
                              title="Supprimer">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Formulaire */}
          <div>
            <FormulaireMatiere orgId={orgId} onSuccess={() => {}} />
          </div>
        </div>
      )}

      {/* Onglet Fournisseurs */}
      {onglet === 'fournisseurs' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tableau */}
          <div className="lg:col-span-2 taama-card overflow-hidden">
            {filteredSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Truck size={28} style={{ color: 'var(--text3)' }} />
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  {debouncedSearch ? 'Aucun fournisseur trouvé.' : 'Aucun fournisseur dans le catalogue.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Nom', 'Contact', 'Localisation', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                          style={{ color: 'var(--text3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((s, i) => (
                      <tr key={s.id}
                        style={{ borderBottom: i < filteredSuppliers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text)' }}>{s.name}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text2)' }}>{s.contact ?? '—'}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text2)' }}>{s.location ?? '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => supprimerF(s.id)} disabled={isPendingDel}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ color: 'var(--text3)' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Formulaire */}
          <div>
            <FormulaireFournisseur orgId={orgId} onSuccess={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}
