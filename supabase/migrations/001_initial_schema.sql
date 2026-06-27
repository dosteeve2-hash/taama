-- ============================================================
-- TAAMA — Schéma initial v1.0
-- Industries de transformation — Burkina Faso
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGANISATIONS (multi-tenant)
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sector TEXT,
  logo_url TEXT,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SITES (usines / entrepôts par organisation)
-- ============================================================
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'usine',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILS UTILISATEURS
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'operator',
  site_id UUID REFERENCES sites(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATALOGUE — MATIÈRES ET PRODUITS
-- ============================================================
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOURNISSEURS
-- ============================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVENTAIRE (stock actuel par site et matière)
-- ============================================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  quantity DECIMAL(12,3) DEFAULT 0,
  min_threshold DECIMAL(12,3) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, material_id)
);

-- ============================================================
-- MOUVEMENTS DE STOCK
-- ============================================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('in','out','adjustment')),
  quantity DECIMAL(12,3) NOT NULL,
  reason TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  reference TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOTS DE PRODUCTION (batches)
-- ============================================================
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('planned','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENTRÉES D'UN LOT (matières premières consommées)
-- ============================================================
CREATE TABLE batch_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  quantity_planned DECIMAL(12,3),
  quantity_used DECIMAL(12,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SORTIES D'UN LOT (produits finis obtenus)
-- ============================================================
CREATE TABLE batch_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  quantity_produced DECIMAL(12,3) NOT NULL,
  quality_grade TEXT,
  lot_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALERTES
-- ============================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = (SELECT auth.uid())
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "org_isolation" ON organizations FOR ALL USING (id = get_my_org_id());
CREATE POLICY "org_isolation" ON sites FOR ALL USING (org_id = get_my_org_id());
CREATE POLICY "own_profile" ON user_profiles FOR ALL USING (id = (SELECT auth.uid()) OR org_id = get_my_org_id());
CREATE POLICY "org_isolation" ON materials FOR ALL USING (org_id = get_my_org_id());
CREATE POLICY "org_isolation" ON suppliers FOR ALL USING (org_id = get_my_org_id());
CREATE POLICY "org_isolation" ON inventory FOR ALL
  USING (site_id IN (SELECT id FROM sites WHERE org_id = get_my_org_id()));
CREATE POLICY "org_isolation" ON inventory_movements FOR ALL
  USING (site_id IN (SELECT id FROM sites WHERE org_id = get_my_org_id()));
CREATE POLICY "org_isolation" ON batches FOR ALL
  USING (site_id IN (SELECT id FROM sites WHERE org_id = get_my_org_id()));
CREATE POLICY "org_isolation" ON batch_inputs FOR ALL
  USING (batch_id IN (SELECT id FROM batches WHERE site_id IN (SELECT id FROM sites WHERE org_id = get_my_org_id())));
CREATE POLICY "org_isolation" ON batch_outputs FOR ALL
  USING (batch_id IN (SELECT id FROM batches WHERE site_id IN (SELECT id FROM sites WHERE org_id = get_my_org_id())));
CREATE POLICY "org_isolation" ON alerts FOR ALL USING (org_id = get_my_org_id());

-- ============================================================
-- TRIGGER : mise à jour stock automatique lors d'un mouvement
-- ============================================================
CREATE OR REPLACE FUNCTION update_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (site_id, material_id, quantity)
  VALUES (NEW.site_id, NEW.material_id, 0)
  ON CONFLICT (site_id, material_id) DO NOTHING;

  IF NEW.type = 'in' THEN
    UPDATE inventory SET quantity = quantity + NEW.quantity, updated_at = NOW()
    WHERE site_id = NEW.site_id AND material_id = NEW.material_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE inventory SET quantity = GREATEST(0, quantity - NEW.quantity), updated_at = NOW()
    WHERE site_id = NEW.site_id AND material_id = NEW.material_id;
  ELSIF NEW.type = 'adjustment' THEN
    UPDATE inventory SET quantity = NEW.quantity, updated_at = NOW()
    WHERE site_id = NEW.site_id AND material_id = NEW.material_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_inventory_movement
  AFTER INSERT ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION update_inventory_on_movement();

-- NOTE : Désactiver la confirmation email dans Supabase Dashboard
-- Authentication > Providers > Email > "Confirm email" = OFF
