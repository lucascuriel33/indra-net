-- ══════════════════════════════════════════════════════════════
-- Indra Net — D1 Database Schema
-- ══════════════════════════════════════════════════════════════
-- Run: npx wrangler d1 execute indra-net-db --file=schema.sql --remote

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  description TEXT   DEFAULT '',
  price      REAL    NOT NULL,
  image_url  TEXT    DEFAULT '',
  category   TEXT    DEFAULT 'General',
  stock      INTEGER DEFAULT 0,
  featured   INTEGER DEFAULT 0,
  created_at TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email   TEXT    NOT NULL,
  customer_name    TEXT    DEFAULT '',
  status           TEXT    DEFAULT 'pending',
  total            REAL    DEFAULT 0.0,
  mp_preference_id TEXT    DEFAULT '',
  mp_payment_id    TEXT    DEFAULT '',
  created_at       TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT    DEFAULT '',
  quantity     INTEGER DEFAULT 1,
  unit_price   REAL    DEFAULT 0.0
);

CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
