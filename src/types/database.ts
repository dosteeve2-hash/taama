// ============================================================
// TAAMA — Types TypeScript correspondant au schéma Supabase
// ============================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  logo_url: string | null;
  plan: 'trial' | 'starter' | 'pro';
  trial_ends_at: string;
  created_at: string;
}

export interface Site {
  id: string;
  org_id: string;
  name: string;
  location: string | null;
  type: 'usine' | 'entrepot' | 'ferme';
  created_at: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'operator';
  site_id: string | null;
  avatar_url: string | null;
  created_at: string;
  // Relations jointes
  organizations?: Organization;
  sites?: Site;
}

export interface Material {
  id: string;
  org_id: string;
  name: string;
  unit: string;
  category: 'raw' | 'finished' | 'byproduct';
  description: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  org_id: string;
  name: string;
  contact: string | null;
  location: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  site_id: string;
  material_id: string;
  quantity: number;
  min_threshold: number;
  updated_at: string;
  // Relations jointes
  materials?: Material;
}

export interface InventoryMovement {
  id: string;
  site_id: string;
  material_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string | null;
  supplier_id: string | null;
  reference: string | null;
  created_by: string | null;
  created_at: string;
  // Relations jointes
  materials?: Material;
  suppliers?: Supplier;
}

export interface Batch {
  id: string;
  site_id: string;
  batch_number: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Relations jointes
  batch_inputs?: BatchInput[];
  batch_outputs?: BatchOutput[];
}

export interface BatchInput {
  id: string;
  batch_id: string;
  material_id: string;
  quantity_planned: number | null;
  quantity_used: number;
  created_at: string;
  // Relations jointes
  materials?: Material;
}

export interface BatchOutput {
  id: string;
  batch_id: string;
  material_id: string;
  quantity_produced: number;
  quality_grade: string | null;
  lot_code: string | null;
  created_at: string;
  // Relations jointes
  materials?: Material;
}

export interface Alert {
  id: string;
  org_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Types utilitaires ────────────────────────────────────────────────────────

/** Stats globales pour le dashboard */
export interface DashboardStats {
  batchesInProgress: number;
  avgYield: number;
  stockAlerts: number;
  tonnesThisMonth: number;
}

/** Résultat d'une Server Action */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
