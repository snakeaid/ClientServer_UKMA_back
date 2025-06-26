CREATE TABLE IF NOT EXISTS product_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_product_group
        FOREIGN KEY(group_id)
        REFERENCES product_groups(id)
        ON DELETE CASCADE
); 