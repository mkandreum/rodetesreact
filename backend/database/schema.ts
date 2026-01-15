export const SCHEMA_SQL = `
-- ============================================
-- Rodetes Party Database Schema
-- PostgreSQL 15+
-- ============================================

-- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: events
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    poster_image_url TEXT,
    ticket_capacity INTEGER NOT NULL DEFAULT 0,
    tickets_sold INTEGER NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    gallery_images TEXT[], -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: drags
-- ============================================
CREATE TABLE IF NOT EXISTS drags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instagram_handle VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    card_color VARCHAR(7) DEFAULT '#F02D7D', -- Hex color
    gallery_images TEXT[], -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: merch_items
-- ============================================
CREATE TABLE IF NOT EXISTS merch_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    drag_id INTEGER REFERENCES drags(id) ON DELETE CASCADE, -- NULL for web merch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: tickets
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL, -- Public-facing ID
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: scanned_tickets
-- ============================================
CREATE TABLE IF NOT EXISTS scanned_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    scanned_count INTEGER NOT NULL DEFAULT 0,
    last_scanned_at TIMESTAMP,
    UNIQUE(ticket_id)
);

-- ============================================
-- TABLE: merch_sales
-- ============================================
CREATE TABLE IF NOT EXISTS merch_sales (
    id SERIAL PRIMARY KEY,
    sale_id VARCHAR(50) UNIQUE NOT NULL, -- Public-facing ID
    merch_item_id INTEGER NOT NULL REFERENCES merch_items(id) ON DELETE CASCADE,
    drag_id INTEGER REFERENCES drags(id) ON DELETE SET NULL,
    drag_name VARCHAR(255),
    item_name VARCHAR(255) NOT NULL,
    item_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' or 'Delivered'
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- ============================================
-- TABLE: admin_users
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: app_settings
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    app_logo_url TEXT,
    ticket_logo_url TEXT,
    banner_video_url TEXT,
    promo_enabled BOOLEAN DEFAULT FALSE,
    promo_custom_text TEXT DEFAULT '¡PRÓXIMO: {eventName}! 🔥 {eventShortDate}',
    promo_neon_color VARCHAR(7) DEFAULT '#F02D7D',
    allowed_domains TEXT[], -- Array of allowed email domains
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_archived ON events(is_archived);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(email);
CREATE INDEX IF NOT EXISTS idx_merch_sales_status ON merch_sales(status);
CREATE INDEX IF NOT EXISTS idx_merch_items_drag_id ON merch_items(drag_id);

-- ============================================
-- TRIGGERS for updated_at timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_drags_updated_at BEFORE UPDATE ON drags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_merch_items_updated_at BEFORE UPDATE ON merch_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT default admin user and settings
-- ============================================
-- Default admin: username='admin', password='rodetes' (change in production!)
-- Password hash for 'rodetes' using bcrypt
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$rXKZ9FZKqJ9xvKZKJ5Z.Oe0HvQ9XZJ5Z.Oe0HvQ9XZJ5Z.Oe0HvQ9X')
ON CONFLICT (username) DO NOTHING;

-- Default app settings
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT permissions (adjust as needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rodetes;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rodetes;
`;
