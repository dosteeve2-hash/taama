'use client';

// Client Component — Section alertes avec bouton "Marquer comme lue"
import { useTransition } from 'react';
import { AlertTriangle, CheckCircle, Bell, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { marquerAlerteLue } from './actions';
import type { Alert } from '@/types/database';

interface Props {
  alertes: Alert[];
}

export default function DashboardAlertes({ alertes }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleMarquerLue = (id: string) => {
    startTransition(async () => {
      await marquerAlerteLue(id);
    });
  };

  const typeStyle: Record<string, { bg: string; color: string }> = {
    stock_critique: { bg: 'rgba(240,168,50,0.1)',  color: 'var(--amber)' },
    erreur:         { bg: 'rgba(248,81,73,0.1)',   color: 'var(--red)' },
    info:           { bg: 'rgba(88,166,255,0.1)',  color: 'var(--blue)' },
  };

  if (alertes.length === 0) {
    return (
      <div className="taama-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} style={{ color: 'var(--text3)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Dernières alertes</h2>
        </div>
        <div className="py-6 text-center text-sm" style={{ color: 'var(--text3)' }}>
          <CheckCircle size={20} className="mx-auto mb-2" style={{ color: 'var(--green)' }} />
          Aucune alerte non lue — tout est sous contrôle.
        </div>
      </div>
    );
  }

  return (
    <div className="taama-card overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--amber)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Dernières alertes
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(240,168,50,0.15)', color: 'var(--amber)' }}>
            {alertes.length}
          </span>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {alertes.map((alerte) => {
          const style = typeStyle[alerte.type] ?? typeStyle['info'];
          return (
            <div key={alerte.id} className="px-5 py-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: style.bg }}>
                <AlertTriangle size={13} style={{ color: style.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text)' }}>{alerte.message}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                  {format(new Date(alerte.created_at), "d MMM 'à' HH'h'mm", { locale: fr })}
                </p>
              </div>
              <button
                onClick={() => handleMarquerLue(alerte.id)}
                disabled={isPending}
                className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                style={{ border: '1px solid var(--border2)', color: 'var(--text2)' }}
                title="Marquer comme lue"
              >
                {isPending
                  ? <Loader2 size={11} className="animate-spin" />
                  : <CheckCircle size={11} />
                }
                Lu
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
