-- 001_initial_schema.sql
-- Create core tables for Findly

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    currency VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, slug)
);

-- Business Categories
CREATE TABLE IF NOT EXISTS business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    parent_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Services (e.g., "Laptop Repair", "Haircut")
CREATE TABLE IF NOT EXISTS business_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'suspended', 'archived')),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Category Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS business_category_assignments (
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES business_categories(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (business_id, category_id)
);

-- Business Service Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS business_service_assignments (
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (business_id, service_id)
);

-- Business Contacts (multiple contact methods)
CREATE TABLE IF NOT EXISTS business_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('phone', 'email', 'website', 'social', 'other')),
    value VARCHAR(500) NOT NULL,
    label VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Opening Hours
CREATE TABLE IF NOT EXISTS business_opening_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, day_of_week)
);

-- Business Images
CREATE TABLE IF NOT EXISTS business_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(500),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Business Submissions (for user-submitted businesses)
CREATE TABLE IF NOT EXISTS business_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    proposed_category_ids UUID[],
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_neighborhood ON businesses(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_business_category_assignments_category ON business_category_assignments(category_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city_id);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);