const express = require('express');
const connectDB = require('../database/mongodb'); // Se necessário para conexão com o banco de dados
const App = require('../models/app'); // Supondo que há um modelo App para aplicativos
const router = express.Router();

// Conectar ao banco de dados (se necessário)
connectDB()
// Rota de boas-vindas
router.get('/', (req, res) => {
    res.status(200).send({
        message: 'Welcome to the App Store API'
    });
});

// Rota para adicionar um aplicativo
router.post('/add', async (req, res) => {
    const { appName, packageName, category, description, logoUrl, version, price } = req.body;
    try {
        const newApp = new App({ appName, packageName, category, description, logoUrl, version, price });
        const savedApp = await newApp.save();
        return res.status(201).send({
            error_code: 0,
            info: "Good",
            msg: "App added successfully",
            app: savedApp
        });
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error adding app",
            error: error.message
        });
    }
});

// Rota para atualizar um aplicativo
router.put('/update', async (req, res) => {
    const { packageName, appName, category, description, logoUrl } = req.body;

    // Validar a entrada
    if (!packageName) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Package name is required"
        });
    }

    try {
        // Encontrar e atualizar o aplicativo com base no packageName
        const updatedApp = await App.findOneAndUpdate(
            { packageName }, // Filtro para encontrar o aplicativo
            { appName, category, description, logoUrl }, // Atualizar os campos
            { new: true } // Retornar o documento atualizado
        );

        if (updatedApp) {
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "App updated successfully",
                app: updatedApp
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "App not found"
            });
        }
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error updating app",
            error: error.message
        });
    }
});

// Rota para listar todos os aplicativos
router.get('/list-all', async (req, res) => {
    try {
        const apps = await App.find(); // Encontra todos os aplicativos
        return res.status(200).send({
            error_code: 0,
            info: "Good",
            msg: "Apps fetched successfully",
            apps
        });
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error fetching apps",
            error: error.message
        });
    }
});

// Rota para buscar um aplicativo específico por ID
router.get('/list/', async (req, res) => {
    const { packageName } = req.body;
    try {
        const app = await App.findOne({packageName: packageName}); // Encontra o aplicativo por ID
        if (app) {
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "App fetched successfully",
                app
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "App not found"
            });
        }
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error fetching app",
            error: error.message
        });
    }
});

// Rota para listar aplicativos por categoria
router.get('/list/category', async (req, res) => {
    const { category } = req.query;
    try {
        if(!category){
        const apps = await App.find({ category }); // Encontra aplicativos por categoria
        return res.status(200).send({
            error_code: 0,
            info: "Good",
            msg: "Apps fetched successfully",
            apps
        });}
        return res.status(404).send({
            error_code: 1,
            info: "Bad",
            msg: "Apps not found"
        });

    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error fetching apps",
            error: error.message
        });
    }
});

// Rota para listar aplicativos por faixa de preço
router.get('/list/price', async (req, res) => {
    const { minPrice, maxPrice } = req.query;
    try {
        // Converte os preços para número
        const min = parseFloat(minPrice) || 0;
        const max = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;
        
        const apps = await App.find({
            price: { $gte: min, $lte: max } // Filtra aplicativos por faixa de preço
        });
        return res.status(200).send({
            error_code: 0,
            info: "Good",
            msg: "Apps fetched successfully",
            apps
        });
    } catch (error) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Error fetching apps",
            error: error.message
        });
    }
  
});

router.put('/change-status', async (req, res) => {
    const { packageName, status } = req.body;
    if (status !== true && status !== false) {
        return res.status(400).send({
            error_code: 1,
            info: "Bad",
            msg: "Unsupported Value of Status"
        });
    }
    try {
        const app = await App.findOne({ packageName });
        if (app) {
            app.activateStatus = status;
            const updatedUser = await app.save();
            return res.status(200).send({
                error_code: 0,
                info: "Good",
                msg: "Status Updated",
                user: updatedUser
            });
        } else {
            return res.status(404).send({
                error_code: 1,
                info: "Bad",
                msg: "User not found"
            });
        }
    } catch (error) {
        return res.status(500).send({
            error_code: 1,
            info: "Bad",
            msg: "Error processing request",
            error: error.message
        });
    }
});


module.exports = router;
