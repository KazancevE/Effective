const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Инициализация
const sequelize = new Sequelize('postgres://postgres:qwerty@db:5432/testdb');
const app = express();
app.use(express.json());

// Модели
const Product = sequelize.define('Product', {
    plu: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Inventory = sequelize.define('Inventory', {
    quantity_on_shelf: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quantity_in_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Ассоциации
Product.hasMany(Inventory);
Inventory.belongsTo(Product);

// Создание товара
app.post('/api/products', async (req, res) => {
    try {
        const { plu, name } = req.body;
        const product = await Product.create({ plu, name });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Создание остатка
app.post('/api/inventory', async (req, res) => {
    try {
        const { productId, shopId, quantityOnShelf, quantityInOrder } = req.body;
        const inventory = await Inventory.create({ productId, shopId, quantityOnShelf, quantityInOrder });
        res.status(201).json(inventory);
    } catch (error) {
        console.error('Error creating inventory:', error);
        res.status(500).json({ message: 'Error creating inventory' });
    }
});

// Увеличение остатка
app.patch('/api/inventory/:id/increase', async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id);
        if (inventory) {
            const { amount } = req.body;
            inventory.quantity_on_shelf += amount;
            await inventory.save();
            res.json(inventory);
        } else {
            res.status(404).json({ message: 'Inventory not found' });
        }
    } catch (error) {
        console.error('Error increasing inventory:', error);
        res.status(500).json({ message: 'Error increasing inventory' });
    }
});

// Уменьшение остатка
app.patch('/api/inventory/:id/decrease', async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id);
        if (inventory) {
            const { amount } = req.body;
            inventory.quantity_on_shelf = Math.max(0, inventory.quantity_on_shelf - amount);
            await inventory.save();
            res.json(inventory);
        } else {
            res.status(404).json({ message: 'Inventory not found' });
        }
    } catch (error) {
        console.error('Error decreasing inventory:', error);
        res.status(500).json({ message: 'Error decreasing inventory' });
    }
});

// Получение остатков по фильтрам
app.get('/api/inventory', async (req, res) => {
    try {
        const { plu, shop_id, quantity_on_shelf, quantity_in_order } = req.query;
        const where = {};
        if (plu) where['$Product.plu$'] = plu;

        if (shop_id) where.shopId = shop_id;
        if (quantity_on_shelf) where.quantity_on_shelf = quantity_on_shelf;

        if (quantity_in_order) where.quantity_in_order = quantity_in_order;

        const inventories = await Inventory.findAll({ where, include: [Product] });
        res.json(inventories);
    } catch (error) {
        console.error('Error fetching inventories:', error);
        res.status(500).json({ message: 'Error fetching inventories' });
    }
});

// Получение товаров по фильтрам
app.get('/api/products', async (req, res) => {
    try {
        const { name, plu } = req.query;
        const where = {};
        if (name) where.name = name;
        if (plu) where.plu = plu;

        const products = await Product.findAll({ where });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Запуск сервера
app.listen(3000, async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Inventory service running on http://localhost:3000');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
});
