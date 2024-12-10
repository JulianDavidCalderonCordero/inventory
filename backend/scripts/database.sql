-- Active: 1733792465285@@inventory-db-jln-test-inventory-db.d.aivencloud.com@15119@defaultdb@public
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY, -- Auto-increment primary key
    name VARCHAR(255) NOT NULL, -- Product name
    description TEXT, -- Optional description
    created_at DATE DEFAULT CURRENT_DATE, -- Creation date, defaults to the current date
);
CREATE TABLE batches (
    batch_id SERIAL PRIMARY KEY, -- Auto-increment primary key
    product_id INT NOT NULL, -- Foreign key to products
    quantity NUMERIC(10, 2) NOT NULL, -- Available quantity in the batch
    entry_date DATE NOT NULL, -- Date the batch was added to inventory
    expiration_date DATE NOT NULL, -- Batch expiration date
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (product_id)
);
CREATE TABLE movements (
    movement_id SERIAL PRIMARY KEY, -- Auto-increment primary key
    batch_id INT NOT NULL, -- Foreign key to batches
    MOVEMENT_TYPE TEXT NOT NULL, -- Movement type (entry/exit)
    quantity NUMERIC(10, 2) NOT NULL, -- Quantity affected by the movement
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Movement date
    reason TEXT, -- Optional reason for the movement
    CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES batches (batch_id)
);