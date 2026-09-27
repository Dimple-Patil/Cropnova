-- CropNova PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'farmer', -- 'farmer', 'expert', 'vendor', 'admin'
    phone VARCHAR(20),
    location VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    size_acres DECIMAL(10,2) NOT NULL,
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Harvested', 'Failed'
    field_section VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_records (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    ph_level DECIMAL(4,2),
    nitrogen_ppm INT,
    phosphorus_ppm INT,
    potassium_ppm INT,
    organic_matter_pct DECIMAL(4,2),
    moisture_pct DECIMAL(4,2),
    test_date DATE DEFAULT CURRENT_DATE,
    recommendations TEXT
);

CREATE TABLE IF NOT EXISTS disease_records (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    image_url VARCHAR(255),
    detected_disease VARCHAR(150),
    confidence_score DECIMAL(5,2),
    remedy_organic TEXT,
    remedy_chemical TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_products (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Seeds', 'Fertilizers', 'Equipment', 'Produce'
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock_quantity INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_orders (
    id SERIAL PRIMARY KEY,
    buyer_id INT REFERENCES users(id),
    product_id INT REFERENCES marketplace_products(id),
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Shipped', 'Delivered', 'Cancelled'
    shipping_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expert_consultations (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id),
    expert_id INT REFERENCES users(id),
    question_title VARCHAR(200) NOT NULL,
    question_details TEXT NOT NULL,
    response TEXT,
    status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Answered'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS government_schemes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    subsidy_amount VARCHAR(100),
    eligibility TEXT,
    application_link VARCHAR(255),
    deadline VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS news_updates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50), -- 'Technology', 'Market Price', 'Weather Advisory', 'General'
    content TEXT NOT NULL,
    source VARCHAR(100),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_expenses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_id INT REFERENCES farms(id),
    type VARCHAR(20) CHECK (type IN ('Income', 'Expense')),
    category VARCHAR(100) NOT NULL, -- 'Seeds', 'Fertilizer', 'Labor', 'Equipment Harvest Sale'
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- 'weather', 'disease', 'order', 'scheme'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_task_states (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id)
);

CREATE TABLE IF NOT EXISTS irrigation_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    crop_id INT REFERENCES crops(id) ON DELETE CASCADE,
    watered BOOLEAN NOT NULL,
    scheduled_date DATE,
    next_date DATE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_market_prices (
    id SERIAL PRIMARY KEY,
    crop_key VARCHAR(50) UNIQUE NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    price_per_quintal DECIMAL(10,2) NOT NULL,
    yield_per_acre DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO crop_market_prices (crop_key, crop_name, price_per_quintal, yield_per_acre)
VALUES
  ('rice', 'Rice', 2183, 28),
  ('wheat', 'Wheat', 2275, 22),
  ('cotton', 'Cotton', 6620, 15),
  ('maize', 'Maize', 2090, 25),
  ('mustard', 'Mustard', 5650, 12)
ON CONFLICT (crop_key) DO NOTHING;
