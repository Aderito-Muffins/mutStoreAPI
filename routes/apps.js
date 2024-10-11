const express = require('express');
const connectDB = require('../database/mongodb'); // Se necessário para conexão com o banco de dados
const AppModel = require('../models/app'); // Supondo que há um modelo App para aplicativos

const router = express.Router();
const { upload, uploadToFirebase } = require("../database/googledb");
require('dotenv').config();

// Conectar ao banco de dados (se necessário)
connectDB()

const generateUniqueId = async () => {
    let newId;
    let exists = true;

    while (exists) {
        newId = Math.floor(Math.random() * 1000000); // Gera um número aleatório
        const existingApp = await AppModel.findOne({ id: newId });
        exists = existingApp !== null; // Verifica se já existe
    }

    return newId;
};


// Rota de boas-vindas
router.get('/', (req, res) => {
    res.status(200).send({
        message: 'Welcome to the App Store API'
    });
});



// Função para buscar a lista resumida
router.get('/summary', async (req, res) => {
    try {
        // Extrai parâmetros da query string
        const { limit = 10, offset = 0, type } = req.query; // limit e offset com valores padrão

        // Cria um objeto de consulta com base no tipo (jogo ou aplicação)
        const query = type ? { tipo: type } : {}; // Assumindo que você tem um campo `tipo` no seu modelo

        // Busca os apps com limit e offset
        const apps = await AppModel.find(query)
            .select('nome icon id')
            .skip(Number(offset))  // Aplicando offset
            .limit(Number(limit));  // Aplicando limit

        // Mapeia os apps para o formato desejado
        const formattedApps = apps.map(app => ({
            appId: app.id,   // Ou app._id, dependendo do seu esquema
            nome: app.nome,
            iconUrl: app.icon
        }));

        // Total de apps para facilitar a paginação
        const totalApps = await AppModel.countDocuments(query);

        res.status(200).json({
            error_code: 0,
            message: "Carregado!",
            total: totalApps,  // Adiciona total de apps encontrados
            apps: formattedApps // Envia a lista formatada de apps
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar os apps', error });
    }
});

router.get('/moreInfo/:id', async (req, res) => {
    try {
        const { id } = req.query; // Obtém o ID do aplicativo a partir dos parâmetros da URL

        // Busca o aplicativo pelo ID
        const app = await AppModel.findOne({appId: id});

        // Verifica se o aplicativo foi encontrado
        if (!app) {
            return res.status(404).json({
                error_code: 1,
                message: 'Aplicativo não encontrado'
            });
        }

    

        res.status(200).json({
            error_code: 0,
            message: 'Detalhes do aplicativo carregados!',
            app
        });
    } catch (error) {
        res.status(500).json({ 
            error_code: 2,
            message: 'Erro ao buscar os detalhes do aplicativo',
            error: error.message
        });
    }
});

// Rota para adicionar um aplicativo
router.post('/create/app', upload, async (req, res) => {
    try {
      const { nome, developerName, preco, description, politics, isMpesa, isEmola, isBankCard  } = req.body;
  
      // Gerar um ID único (deve ser numérico se o modelo exige)
      const uniqueID = await generateUniqueId(); // Certifique-se de que isso retorna um número
  
      // Agora que temos o ID, podemos passar para o upload
      req.body.id = uniqueID; // Passa o ID gerado para o req.body, para ser usado no upload
  
      // Chama o middleware de upload para Firebase, passando o ID gerado
      await uploadToFirebase(req, res, async (err) => {
        if (err) {
          return res.status(500).send({ code: 1, message: 'Erro ao fazer upload das imagens', error: err.message });
        }
  
        // Verifica se o ícone foi carregado com sucesso
        const iconUrl = req.file && req.file.iconUrl ? req.file.iconUrl : null;
        if (!iconUrl) {
          return res.status(400).send({ code: 1, message: 'O campo icon é obrigatório.' });
        }

        const appFileUrl = req.file && req.file.appUrl ? req.file.appUrl : null;
        if (!appFileUrl) {
          return res.status(400).send({ code: 1, message: 'O campo appFile é obrigatório.' });
        }
  
  
        // Coleta as URLs das imagens de captura de tela
        const imagePaths = req.file.firebaseUrls || [];
  
        // Cria uma nova instância do modelo de aplicativo
        const newApp = new AppModel({
          id: uniqueID, // Certifique-se de que uniqueID é um número
          icon: iconUrl, // URL da imagem do ícone
          nome,
          developerName,
          imagePaths, // URLs das imagens de captura de tela
          preco,
          description,
          politics,
          appFilePath: appFileUrl,
          payments:{
            isEmola,
            isMpesa,
            isBankCard
          }
        });
  
        // Salvar o novo app
        await newApp.save();
        res.status(201).send({ code: 0, message: 'Aplicativo salvo com sucesso!', app: newApp });
      });
    } catch (error) {
      console.error('Error saving the app:', error);
      res.status(500).send({ code: 1, message: 'Erro ao salvar o aplicativo', error: error.message });
    }
  });

  // Rota para listar todos os aplicativos
  router.get('/list/apps', async (req, res) => {
    try {
        const apps = await AppModel.find().select('-_id'); // Excluir o campo _id
        res.status(200).send({ code: 0, message: 'Lista de aplicativos recuperada com sucesso!', apps });
    } catch (error) {
        console.error('Erro ao recuperar aplicativos:', error);
        res.status(500).send({ code: 1, message: 'Erro ao recuperar aplicativos', error: error.message });
    }
});

// Rota para visualizar um aplicativo específico
router.get('/list/app/:id', async (req, res) => {
    try {
        const appId = req.params.id;
        const app = await AppModel.findOne({ id: appId });

        if (!app) {
            return res.status(404).send({ code: 1, message: 'Aplicativo não encontrado.' });
        }

        res.status(200).send({ code: 0,
             message: 'Aplicativo encontrado!',
              app: {

              }
            });
    } catch (error) {
        console.error('Erro ao recuperar o aplicativo:', error);
        res.status(500).send({ code: 1, message: 'Erro ao recuperar o aplicativo', error: error.message });
    }
});
// Rota para atualizar um aplicativo
router.put('/update/app/:id', upload, async (req, res) => {
    try {
        const appId = req.params.id;
        const { nome, developerName, preco, description, politics, isMpesa, isEmola, isBankCard } = req.body;

        // Verifica se o aplicativo existe
        const existingApp = await AppModel.findOne({ id: appId });
        if (!existingApp) {
            return res.status(404).send({ code: 1, message: 'Aplicativo não encontrado.' });
        }

        // Chama o middleware de upload para Firebase, se necessário
        await uploadToFirebase(req, res, async (err) => {
            if (err) {
                return res.status(500).send({ code: 1, message: 'Erro ao fazer upload das imagens', error: err.message });
            }

            // Atualiza os dados do aplicativo
            existingApp.nome = nome || existingApp.nome;
            existingApp.developerName = developerName || existingApp.developerName;
            existingApp.preco = preco || existingApp.preco;
            existingApp.description = description || existingApp.description;
            existingApp.politics = politics || existingApp.politics;

            // Atualiza os caminhos do ícone e do aplicativo, se fornecidos
            if (req.file) {
                existingApp.icon = req.file.iconUrl || existingApp.icon;
                existingApp.appFilePath = req.file.appUrl || existingApp.appFilePath;
                existingApp.imagePaths = req.file.firebaseUrls || existingApp.imagePaths;
            }

            existingApp.payments.isEmola = isEmola !== undefined ? isEmola : existingApp.payments.isEmola;
            existingApp.payments.isMpesa = isMpesa !== undefined ? isMpesa : existingApp.payments.isMpesa;
            existingApp.payments.isBankCard = isBankCard !== undefined ? isBankCard : existingApp.payments.isBankCard;

            // Salva as alterações
            await existingApp.save();
            res.status(200).send({ code: 0, message: 'Aplicativo atualizado com sucesso!', app: existingApp });
        });
    } catch (error) {
        console.error('Erro ao atualizar o aplicativo:', error);
        res.status(500).send({ code: 1, message: 'Erro ao atualizar o aplicativo', error: error.message });
    }
});
// Rota para excluir um aplicativo
router.delete('/delete/app/:id', async (req, res) => {
    try {
        const appId = req.params.id;
        const deletedApp = await AppModel.findOneAndDelete({ id: appId });

        if (!deletedApp) {
            return res.status(404).send({ code: 1, message: 'Aplicativo não encontrado.' });
        }

        res.status(200).send({ code: 0, message: 'Aplicativo excluído com sucesso!', app: deletedApp });
    } catch (error) {
        console.error('Erro ao excluir o aplicativo:', error);
        res.status(500).send({ code: 1, message: 'Erro ao excluir o aplicativo', error: error.message });
    }
});

  
module.exports = router;
