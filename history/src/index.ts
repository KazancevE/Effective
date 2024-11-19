import express = require('express');
import { Request, Response } from 'express';
import { Sequelize, DataTypes, Op } from 'sequelize';
require('dotenv').config();

// Инициализация
const sequelize = new Sequelize('postgres://postgres:qwerty@db:5432/testdb');
const app = express();
app.use(express.json());

// Модель для истории действий
const ActionLog = sequelize.define('ActionLog', {
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true // будет автоматически создавать поля createdAt и updatedAt
});

// Запись действия
app.post('/api/actions', async (req: Request, res: Response) => {
    try {
        const { action, product_id, shop_id } = req.body;
        const log = await ActionLog.create({ action, product_id, shop_id });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error creating action log:', error);
        res.status(500).json({ message: 'Error creating action log' });
    }
});

// Получение истории действий
app.get('/api/actions', async (req: Request, res: Response) => {
    try {
        const { shop_id, product_id, date, action } = req.query;
        const where: any = {};

        if (shop_id) where.shop_id = shop_id;
        if (product_id) where.product_id = product_id;
        if (date && typeof date === 'string') {
            const [from, to] = date.split(',');
            where.createdAt = { [Op.between]: [new Date(from), new Date(to)] }; // Изменен на createdAt
        }
        if (action) where.action = action;

        const logs = await ActionLog.findAll({ where });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching action logs:', error);
        res.status(500).json({ message: 'Error fetching action logs' });
    }
});

// Запуск сервера
app.listen(4000, async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Action history service running on http://localhost:4000');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
});
