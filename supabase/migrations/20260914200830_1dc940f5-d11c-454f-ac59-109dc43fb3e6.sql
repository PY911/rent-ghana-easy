-- roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  city text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);

-- vendors
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT 'Accra',
  about text,
  phone text,
  whatsapp text,
  logo_url text,
  verified boolean NOT NULL DEFAULT false,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT SELECT ON public.vendors TO anon;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "vendors_insert_own" ON public.vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vendors_update_own" ON public.vendors FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vendors_delete_own" ON public.vendors FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- listings
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(12,2) NOT NULL,
  price_unit text NOT NULL DEFAULT 'day',
  min_days int NOT NULL DEFAULT 1,
  city text NOT NULL DEFAULT 'Accra',
  quantity int NOT NULL DEFAULT 1,
  images text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listings_category_idx ON public.listings(category_id);
CREATE INDEX listings_city_idx ON public.listings(city);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_public_read" ON public.listings FOR SELECT USING (status = 'published');
CREATE POLICY "listings_owner_read" ON public.listings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = listings.vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "listings_owner_insert" ON public.listings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = listings.vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "listings_owner_update" ON public.listings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = listings.vendor_id AND v.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = listings.vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "listings_owner_delete" ON public.listings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = listings.vendor_id AND v.owner_id = auth.uid()));

-- bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  total numeric(12,2) NOT NULL DEFAULT 0,
  contact_name text,
  contact_phone text,
  delivery_address text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_renter_read" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = renter_id);
CREATE POLICY "bookings_vendor_read" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.owner_id = auth.uid()));
CREATE POLICY "bookings_renter_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "bookings_renter_update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = renter_id) WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "bookings_vendor_update" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.owner_id = auth.uid()));

-- seed categories
INSERT INTO public.categories (slug, name, description, image_url, sort_order) VALUES
('events-party','Events & Party','Canopies, chairs, tables, cutlery and everything for a full event','/images/chairs-tables.jpg',1),
('sound-lighting','Sound & Lighting','PA systems, DJ gear, stage lights and LED screens','/images/sound-system.jpg',2),
('decor-furniture','Decor & Furniture','Backdrops, drapes, lounge furniture and floral styling','/images/decor-backdrop.jpg',3),
('construction-tools','Construction & Tools','Scaffolding, mixers, power tools and site equipment','/images/scaffolding.jpg',4),
('power-generators','Power & Generators','Silent generators, distribution boards and cabling','/images/generator.jpg',5),
('vehicles','Vehicles','Self-drive and chauffeur-driven cars, buses and pickups','/images/suv.jpg',6),
('photo-video','Photo & Video','Cameras, lenses, lighting kits and drones','/images/camera-kit.jpg',7),
('kids-play','Kids & Play','Bouncy castles, slides, games and party fun','/images/bouncy-castle.jpg',8);

-- seed vendors
INSERT INTO public.vendors (id, name, slug, city, about, phone, whatsapp, verified, rating) VALUES
('11111111-1111-1111-1111-111111111111','Adinkra Events Ghana','adinkra-events','Accra','Full-service event rentals in Greater Accra since 2014. Same-day delivery across Accra and Tema.','+233 24 000 1122','+233 24 000 1122',true,4.9),
('22222222-2222-2222-2222-222222222222','Kumasi Plant & Power','kumasi-plant-power','Kumasi','Construction plant, generators and site tools for contractors across Ashanti Region.','+233 20 555 8890','+233 20 555 8890',true,4.7),
('33333333-3333-3333-3333-333333333333','Bright Frames Studio','bright-frames','Accra','Camera, lens and lighting rentals for film, weddings and content creators.','+233 55 210 4477','+233 55 210 4477',false,4.8),
('44444444-4444-4444-4444-444444444444','Coastal Rides GH','coastal-rides','Takoradi','Clean, insured vehicles for corporate trips, weddings and airport runs.','+233 27 909 3311','+233 27 909 3311',true,4.6);

-- seed listings
INSERT INTO public.listings (vendor_id, category_id, title, slug, description, price, price_unit, min_days, city, quantity, images, featured, status) VALUES
('11111111-1111-1111-1111-111111111111',(SELECT id FROM public.categories WHERE slug='events-party'),'Gold Tiffany Chairs (set of 50)','gold-tiffany-chairs-50','Premium gold tiffany chairs with white cushions. Price is per set of 50, including delivery within Accra and setup by our crew.',900,'day',1,'Accra',12,ARRAY['/images/chairs-tables.jpg'],true,'published'),
('11111111-1111-1111-1111-111111111111',(SELECT id FROM public.categories WHERE slug='events-party'),'Round Banquet Tables with Linen','round-banquet-tables','1.8m round tables seating 10 guests, supplied with pressed white or ivory linen and skirting.',45,'day',1,'Accra',60,ARRAY['/images/chairs-tables.jpg'],false,'published'),
('11111111-1111-1111-1111-111111111111',(SELECT id FROM public.categories WHERE slug='decor-furniture'),'Luxury Floral Backdrop & Draping','luxury-floral-backdrop','Statement floral arch with draped fabric, kente accents and gold plinths. Includes styling and dismantling.',3200,'event',1,'Accra',4,ARRAY['/images/decor-backdrop.jpg'],true,'published'),
('11111111-1111-1111-1111-111111111111',(SELECT id FROM public.categories WHERE slug='kids-play'),'Bouncy Castle & Kids Play Set','bouncy-castle-play-set','Large bouncy castle plus slide and soft play area. Supervised setup, blower and safety mats included.',750,'day',1,'Accra',6,ARRAY['/images/bouncy-castle.jpg'],false,'published'),
('11111111-1111-1111-1111-111111111111',(SELECT id FROM public.categories WHERE slug='sound-lighting'),'Full Stage PA System with Engineer','full-stage-pa-system','Line array PA, digital mixing desk, monitors and stage lighting rig with a sound engineer on site.',4800,'day',1,'Accra',3,ARRAY['/images/sound-system.jpg'],true,'published'),
('22222222-2222-2222-2222-222222222222',(SELECT id FROM public.categories WHERE slug='construction-tools'),'20-Tonne Tracked Excavator','tracked-excavator-20t','SANY SY215C excavator with operator and fuel. Ideal for site clearing, foundations and trenching.',3500,'day',2,'Kumasi',2,ARRAY['/images/excavator.jpg'],true,'published'),
('22222222-2222-2222-2222-222222222222',(SELECT id FROM public.categories WHERE slug='power-generators'),'250 KVA Silent Diesel Generator','250-kva-silent-generator','Fully serviced 250 KVA silent generator with distribution board and cabling. Delivery and technician included.',2100,'day',1,'Kumasi',5,ARRAY['/images/generator.jpg'],true,'published'),
('22222222-2222-2222-2222-222222222222',(SELECT id FROM public.categories WHERE slug='construction-tools'),'Mobile Scaffolding Tower & Tool Kit','scaffolding-tower-tool-kit','6m aluminium mobile tower plus breakers, grinders, circular saw and pressure washer.',480,'day',3,'Kumasi',10,ARRAY['/images/scaffolding.jpg'],false,'published'),
('33333333-3333-3333-3333-333333333333',(SELECT id FROM public.categories WHERE slug='photo-video'),'Cinema Camera & Lighting Package','cinema-camera-lighting-package','RED cinema body, cine prime set, tripod, ARRI lighting kit and grip. Insurance verification required.',1800,'day',1,'Accra',3,ARRAY['/images/camera-kit.jpg'],true,'published'),
('44444444-4444-4444-4444-444444444444',(SELECT id FROM public.categories WHERE slug='vehicles'),'Toyota Land Cruiser with Driver','land-cruiser-with-driver','Executive Land Cruiser with professional driver, fuel for 100km per day, water and airport meet-and-greet.',1450,'day',1,'Takoradi',4,ARRAY['/images/suv.jpg'],false,'published');