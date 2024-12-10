const express = require('express')
const cors = require('cors')
const { QueryTypes } = require('sequelize')

const { client } =   require('./database')
client.authenticate()
    .catch (() => {
        process.exit(1)
    })

const isValidDate = (date_string) => !isNaN(new Date(date_string))

const app = express()

app.use(express.json())
app.use(cors())

app.get('/products', async (req, res) => {
    try {
        // Hacemos la consulta SQL cruda para obtener solo 'id' y 'name'
        const [products, metadata] = await client.query(
          'SELECT product_id, name FROM products', // Asumiendo que la tabla se llama 'products'
          {
            type: QueryTypes.RAW, // Especificamos el tipo de la consulta (SELECT)
          }
        );
        
        // Devolver los productos como respuesta
        console.log(products)
        res.json(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
      }
})

app.get('/inventory', async (req, res) => {
    try {
        // Query para obtener productos y lotes con estado calculado
        const result = await client.query(
            `
            SELECT 
                p.product_id,
                p.name AS product_name,
                b.batch_id,
                b.quantity,
                b.expiration_date,
                CASE
                    WHEN b.expiration_date < CURRENT_DATE THEN 'expired'
                    WHEN b.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 'near_expiry'
                    ELSE 'valid'
                END AS status
            FROM 
                products p
            LEFT JOIN 
                batches b ON p.product_id = b.product_id
            ORDER BY 
                p.product_id, b.expiration_date;
            `,
            { type: QueryTypes.SELECT }
        );

        if (result.length === 0) {
            return res.status(200).json({ message: 'No products in inventory.' });
        }

        // Estructura de respuesta
        const inventory = result.reduce((acc, row) => {
            const productIndex = acc.findIndex(item => item.product_id === row.product_id);
            const batchData = {
                batch_id: row.batch_id,
                quantity: row.quantity,
                expiration_date: row.expiration_date,
                status: row.status,
            };

            if (productIndex === -1) {
                acc.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    batches: [batchData],
                });
            } else {
                acc[productIndex].batches.push(batchData);
            }

            return acc;
        }, []);

        res.status(200).json({ inventory });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
})

app.post('/products', async (req, res) => {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }

    try {
        // Raw SQL query to insert the product
        const result = await client.query(
            `
            INSERT INTO products (name, description, created_at)
            VALUES (:name, :description, CURRENT_DATE)
            RETURNING product_id;
            `,
            {
                replacements: { name, description },
                type: QueryTypes.INSERT,
            }
        );

        const productId = result[0][0].product_id;

        // Respond with the created product's ID
        res.status(201).json({ message: 'Product created successfully', product_id: productId });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
})

app.post('/batches/entry', async (req, res) => {
    const { product_id, quantity, expiration_date } = req.body;

    // Validate input
    if (!product_id || !quantity || !expiration_date) {
        return res.status(400).json({ error: 'product_id, quantity, and expiration_date are required.' });
    }

    if (quantity < 0) {
        return res.status(400).json({ error: 'negative quantity is not allowed.' });
    }

    if (!isValidDate(expiration_date)) {
        return res.status(400).json({ error: 'Invalid date entered.' });
    }

    try {
        // Insert a new batch
        const result = await client.query(
            `
            INSERT INTO batches (product_id, quantity, entry_date, expiration_date)
            VALUES (:product_id, :quantity, CURRENT_DATE, :expiration_date)
            RETURNING batch_id;
            `,
            {
                replacements: { product_id, quantity, expiration_date },
                type: QueryTypes.INSERT,
            }
        );

        const batchId = result[0][0].batch_id;

        // Respond with the created batch ID
        res.status(201).json({ message: 'Batch entry recorded successfully', batch_id: batchId });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Failed to record batch entry' });
    }
})

app.post('/batches/exit', async (req, res) => {
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !quantity) {
        return res.status(400).json({ error: 'product_id and quantity are required.' });
    }

    if (quantity < 0) {
        return res.status(400).json({ error: 'negative quantity is not allowed.' });
    }

    try {
        let remainingQuantity = quantity; // Total quantity to remove
        const usedBatches = []; // Store batches used for the exit

        // Get batches for the product ordered by expiration date (FIFO)
        const batches = await client.query(
            `
            SELECT batch_id, quantity
            FROM batches
            WHERE product_id = :product_id AND quantity > 0
            ORDER BY expiration_date ASC;
            `,
            {
                replacements: { product_id },
                type: QueryTypes.SELECT,
            }
        );

        // Deduct the quantity from batches in FIFO order
        for (const batch of batches) {
            if (remainingQuantity <= 0) break;

            const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
            remainingQuantity -= quantityToDeduct;

            // Update the batch quantity
            await client.query(
                `
                UPDATE batches
                SET quantity = quantity - :quantityToDeduct
                WHERE batch_id = :batch_id;
                `,
                {
                    replacements: { quantityToDeduct, batch_id: batch.batch_id },
                    type: QueryTypes.UPDATE,
                }
            );

            // Record the movement
            await client.query(
                `
                INSERT INTO movements (batch_id, movement_type, quantity)
                VALUES (:batch_id, 'exit', :quantityToDeduct);
                `,
                {
                    replacements: { batch_id: batch.batch_id, quantityToDeduct },
                    type: QueryTypes.INSERT,
                }
            );

            usedBatches.push({ batch_id: batch.batch_id, quantity_removed: quantityToDeduct });
        }

        if (remainingQuantity > 0) {
            return res.status(400).json({ error: 'Not enough stock to fulfill the request.' });
        }

        // Respond with the details of the exit
        res.status(200).json({ message: 'Batch exit recorded successfully', used_batches: usedBatches });
    } catch (error) {
        console.error('Error processing batch exit:', error);
        res.status(500).json({ error: 'Failed to record batch exit' });
    }
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})