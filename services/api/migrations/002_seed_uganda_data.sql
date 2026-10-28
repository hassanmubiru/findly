-- 002_seed_uganda_data.sql
-- Seed Uganda geographic data for initial development

-- Insert Uganda as the first country
INSERT INTO countries (id, name, code, currency) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Uganda', 'UGA', 'UGX')
ON CONFLICT (code) DO NOTHING;

-- Insert Kampala as the first city
INSERT INTO cities (id, country_id, name, slug, latitude, longitude, population) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Kampala', 'kampala', 0.34759, 32.58252, 1600000)
ON CONFLICT (slug) DO NOTHING;

-- Insert neighborhoods of Kampala
INSERT INTO neighborhoods (city_id, name, slug, latitude, longitude) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Central Business District', 'central-business-district', 0.34759, 32.58252),
    ('22222222-2222-2222-2222-222222222222', 'Nagguru', 'nagguru', 0.35291, 32.58272),
    ('22222222-2222-2222-2222-222222222222', 'Ntinda', 'ntinda', 0.36044, 32.58923),
    ('22222222-2222-2222-2222-222222222222', 'Kireka', 'kireka', 0.36512, 32.59345),
    ('22222222-2222-2222-2222-222222222222', 'Bweyogerere', 'bweyogerere', 0.36891, 32.59812),
    ('22222222-2222-2222-2222-222222222222', 'Bugoloobi', 'bugoloobi', 0.34321, 32.57891),
    ('22222222-2222-2222-2222-222222222222', 'Namarobo', 'namarobo', 0.33892, 32.57456),
    ('22222222-2222-2222-2222-222222222222', 'Luzira', 'luzira', 0.31234, 32.56543),
    ('22222222-2222-2222-2222-222222222222', 'Mbuya', 'mbuya', 0.31876, 32.57123),
    ('22222222-2222-2222-2222-222222222222', 'Kawempe', 'kawempe', 0.37892, 32.54321),
    ('22222222-2222-2222-2222-222222222222', 'Makerere', 'makerere', 0.33241, 32.56891),
    ('22222222-2222-2222-2222-222222222222', 'Wandegeya', 'wandegeya', 0.33612, 32.56543),
    ('22222222-2222-2222-2222-222222222222', 'Kisenyi', 'kisenyi', 0.31567, 32.57345),
    ('22222222-2222-2222-2222-222222222222', 'Kasubi', 'kasubi', 0.34219, 32.55234),
    ('22222222-2222-2222-2222-222222222222', 'Kibuli', 'kibuli', 0.32987, 32.55987)
ON CONFLICT (city_id, slug) DO NOTHING;

-- Insert business categories
INSERT INTO business_categories (id, name, slug, description, icon, sort_order) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Restaurants & Food', 'restaurants-food', 'Restaurants, cafes, eateries, and food services', 'restaurant', 1),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Shopping', 'shopping', 'Shops, malls, retail stores', 'shopping_bag', 2),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 'Health & Medical', 'health-medical', 'Hospitals, clinics, pharmacies, doctors', 'local_hospital', 3),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 'Education', 'education', 'Schools, universities, tutoring, training', 'school', 4),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Automotive', 'automotive', 'Car repair, spare parts, fuel stations', 'directions_car', 5),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf', 'Technology', 'technology', 'Computer repair, electronics, IT services', 'computer', 6),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaag', 'Finance', 'finance', 'Banks, ATMs, mobile money, microfinance', 'account_balance', 7),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaah', 'Personal Services', 'personal-services', 'Salons, barbers, laundry, tailoring', 'content_cut', 8),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaai', 'Real Estate', 'real-estate', 'Houses, apartments, land, property agents', 'home', 9),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaj', 'Entertainment', 'entertainment', 'Cinemas, gyms, bars, nightclubs', 'sports_bar', 10),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaak', 'Professional Services', 'professional-services', 'Lawyers, accountants, consultants', 'work', 11),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaal', 'Construction & Home', 'construction-home', 'Hardware, painters, plumbers, electricians', 'construction', 12)
ON CONFLICT (slug) DO NOTHING;

-- Insert business services
INSERT INTO business_services (id, name, slug, description) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'Laptop Repair', 'laptop-repair', 'Laptop and notebook repair services'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'Phone Repair', 'phone-repair', 'Mobile phone repair and screen replacement'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'Computer Sales', 'computer-sales', 'Desktop and laptop computers for sale'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'Software Installation', 'software-installation', 'Operating system and software installation'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', 'Data Recovery', 'data-recovery', 'Recover lost or corrupted data'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 'Network Setup', 'network-setup', 'Home and office network installation'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb07', 'IT Support', 'it-support', 'Technical support and troubleshooting'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08', 'Graphic Design', 'graphic-design', 'Logo design, branding, print materials'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb09', 'Web Development', 'web-development', 'Website design and development'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10', 'Printing Services', 'printing-services', 'Document printing, copying, binding')
ON CONFLICT (slug) DO NOTHING;