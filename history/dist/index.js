"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sequelize_1 = require("sequelize");
// Инициализация
const sequelize = new sequelize_1.Sequelize('postgres://postgres:qwerty@localhost:5432/testdb');
const app = express();
app.use(express.json());
// Модель для истории действий
const ActionLog = sequelize.define('ActionLog', {
    action: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    shop_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true // будет автоматически создавать поля createdAt и updatedAt
});
// Запись действия
app.post('/api/actions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { action, product_id, shop_id } = req.body;
    const log = yield ActionLog.create({ action, product_id, shop_id });
    res.status(201).json(log);
}));
// Получение истории действий
app.get('/api/actions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shop_id, product_id, date, action } = req.query;
    const where = {};
    if (shop_id)
        where.shop_id = shop_id;
    if (product_id)
        where.product_id = product_id;
    if (date && typeof date === 'string') {
        const [from, to] = date.split(',');
        where.created_at = { [sequelize_1.Op.between]: [new Date(from), new Date(to)] };
    }
    if (action)
        where.action = action;
    const logs = yield ActionLog.findAll({ where });
    res.json(logs);
}));
// Запуск сервера
app.listen(4000, () => __awaiter(void 0, void 0, void 0, function* () {
    yield sequelize.sync({ force: true });
    console.log('Action history service running on http://localhost:4000');
}));
