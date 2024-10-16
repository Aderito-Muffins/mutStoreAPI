const express = require('express');
const connectDB = require('../database/mongodb'); // Se necessário para conexão com o banco de dados
const AppModel = require('../models/app');
const User = require('../models/user'); // Supondo que há um modelo App para aplicativos
const authenticateToken = require('../middleware/jwt');
const Transaction = require('../models/transaction');
const router = express.Router();
const { upload, uploadToFirebase } = require("../database/googledb");
require('dotenv').config();

// Conectar ao banco de dados (se necessário)
connectDB()
const JWT_SECRET = process.env.JWT_SECRET || 'eusoufudido';

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return res.status(401).send({ error_code: 1, info: "Ruim", msg: "Token necessário" });

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).send({ error_code: 1, info: "Ruim", msg: "Token inválido" });
//         req.user = user;
//         next();
//     });
// };

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
        const query = { isApproved: true }; // Garante que apenas os apps aprovados sejam listados
        if (type) {
            query.tipo = type;  // Assumindo que você tem um campo `tipo` no seu modelo
        }

        // Busca os apps com limit e offset
        const apps = await AppModel.find(query)
            .select('nome icon id category')
            .skip(Number(offset))  // Aplicando offset
            .limit(Number(limit));  // Aplicando limit

        // Mapeia os apps para o formato desejado
        const formattedApps = apps.map(app => ({
            appId: app.id,   // Ou app._id, dependendo do seu esquema
            nome: app.nome,
            iconUrl: app.icon,
            category: app.category
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

router.get('/search', async (req, res) => {
    try {
        // Extrai parâmetros da query string
        const { limit = 10, offset = 0, keyword, type } = req.query;

        // Cria um objeto de consulta
        const query = { isApproved: true }; // Apenas apps aprovados

        // Se houver uma palavra-chave, adiciona a condição de pesquisa
        if (keyword) {
            query.$or = [
                { nome: { $regex: keyword, $options: 'i' } }, 
                { category: { $regex: keyword, $options: 'i' } }, // Pesquisa por categoria
                { description: { $regex: keyword, $options: 'i' } } // Opcional: pesquisa por descrição, se existir no modelo
            ];
        }

        // Se o tipo for fornecido, adiciona ao filtro de consulta
        if (type) {
            query.tipo = type; // Assumindo que você tem um campo `tipo` no seu modelo
        }

        // Busca os apps com limit e offset
        const apps = await AppModel.find(query)
            .select('nome icon id category description') // Adiciona os campos que deseja retornar
            .skip(Number(offset))  // Aplicando offset
            .limit(Number(limit));  // Aplicando limit

        // Mapeia os apps para o formato desejado
        const formattedApps = apps.map(app => ({
            appId: app.id,   // Ou app._id, dependendo do seu esquema
            nome: app.nome,
            iconUrl: app.icon,
            category: app.category, // Opcional: descrição para resultados mais ricos
        }));

        // Total de apps para facilitar a paginação
        const totalApps = await AppModel.countDocuments(query);

        res.status(200).json({
            error_code: 0,
            message: "Pesquisa concluída!",
            total: totalApps,  // Adiciona total de apps encontrados
            apps: formattedApps // Envia a lista formatada de apps
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar os apps', error });
    }
});


router.get('/moreInfo/:id', async (req, res) => {
    try {
        const { id } = req.params; // Obtém o ID do aplicativo a partir dos parâmetros da URL

        // Busca o aplicativo pelo ID, omitindo o campo '_id' no retorno
        const app = await AppModel.findOne({ id: id });

        // Verifica se o aplicativo foi encontrado
        if (!app) {
            return res.status(404).json({
                error_code: 1,
                message: 'Aplicativo não encontrado'
            });
        }

        // Retorna os detalhes do aplicativo
        res.status(200).json({
            error_code: 0,
            message: 'Detalhes do aplicativo carregados!',
            app
        });
    } catch (error) {
        // Retorna erro em caso de falha
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
        const apps = await AppModel.find().select('-_id -createdAt -politics -description -__v'); // Excluir o campo _id
        res.status(200).send({ code: 0, message: 'Lista de aplicativos recuperada com sucesso!', apps });
    } catch (error) {
        console.error('Erro ao recuperar aplicativos:', error);
        res.status(500).send({ code: 1, message: 'Erro ao recuperar aplicativos', error: error.message });
    }
});


// Rota para visualizar um aplicativo específico

router.put('/change-status', authenticateToken, async (req, res) => {
    const { id, status } = req.body;
    
    // Obter o username do usuário autenticado a partir do token
    const adminUsername = req.user.username;

    // Verificar se o status enviado é válido
    if (typeof status !== 'boolean') {
        return res.status(400).send({
            error_code: 1,
            info: "Ruim",
            msg: "Valor de status não suportado. Use true ou false."
        });
    }

    try {
        // Verificar se o usuário autenticado é um administrador
        const adminUser = await User.findOne({ username: adminUsername });
        if (!adminUser || adminUser.userType !== "admin") {
            return res.status(403).send({
                error_code: 1,
                info: "Ruim",
                msg: "Acesso negado. Apenas administradores podem alterar o status de um usuário."
            });
        }

        // Procurar o usuário cujo status será alterado
        const user = await AppModel.findOne({ id });
        if (user) {
            // Atualizar o status do usuário
            user.isApproved = status; // status será true ou false
            
            // Salvar as alterações
            const updatedUser = await user.save();

            // Resposta de sucesso
            return res.status(200).send({
                error_code: 0,
                info: "Bom",
                msg: "Status atualizado com sucesso",
                user: updatedUser
            });
        } else {
            // Caso o usuário não seja encontrado
            return res.status(404).send({
                error_code: 1,
                info: "Ruim",
                msg: "Usuário não encontrado"
            });
        }
    } catch (error) {
        // Capturar erros de execução
        return res.status(500).send({
            error_code: 1,
            info: "Ruim",
            msg: "Erro ao processar a solicitação",
            error: error.message
        });
    }
});



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

router.post('/purchase/app', authenticateToken, async (req, res) => {
    try {
        const { msisdn, appId, paymentOption } = req.body;
        const user = req.user;

        if (!msisdn || !appId || !paymentOption) {
            return res.status(400).send({
                code: 1,
                message: "Dados insuficientes: msisdn, appId e paymentOption são obrigatórios."
            });
        }

        // Verificar o aplicativo e sua validade
        const app = await AppModel.findOne({ id: appId });
        if (!app || !app.isActive) {
            return res.status(400).send({
                code: 1,
                message: "Aplicativo inválido ou inativo."
            });
        }

        const amount = app.preco;
        const transactionReference = "Compra" + app.name; // Gerar referência de transação de forma dinâmica

        // 1. Registrar a transação com status 'pendente'
        const transaction = await Transaction.create({
            msisdn,
            appId,
            email: user.email,
            amount,
            transactionReference,
            status: 'pending' // Status inicial como pendente
        });

        // Chama a função de pagamento usando Mpesa/eMola
        const paymentResult = await handlePaymentUsing(paymentOption, msisdn, amount, transactionReference);

        // Verifica se o pagamento foi bem-sucedido
        if (!paymentResult.success) {
            // 2. Atualizar o status da transação para 'failed' em caso de erro
            transaction.status = 'failed';
            await transaction.save();

            return res.status(400).send({
                code: 1,
                message: "Ocorreu um erro durante a transação: " + paymentResult.message
            });
        }

        // 3. Atualizar os aplicativos comprados pelo usuário
        let pagos = user.pagos || []; // Verificar se já existe a lista de apps pagos
        pagos.push(appId); // Adicionar o appId à lista de aplicativos comprados

        // Atualizar o usuário com os apps comprados
        const updatedUser = await User.findOneAndUpdate(
            { email: user.email },
            { pagos: pagos }, // Atualiza a lista de aplicativos comprados
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).send({
                code: 1,
                message: "Não foi possível atualizar os dados do usuário."
            });
        }

        // 4. Atualizar o status da transação para 'success'
        transaction.status = 'success';
        transaction.thirdPartyReference = paymentResult.thirdPartyReference;
        await transaction.save();

        return res.status(201).send({
            code: 0,
            message: "Transação efetuada com sucesso!",
            data: {
                transactionId: paymentResult.transactionId,
                conversationId: paymentResult.conversationId,
                thirdPartyReference: paymentResult.thirdPartyReference,
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Erro na solicitação da API:', error.message);

        // 5. Atualizar o status da transação para 'failed' em caso de exceção
        await Transaction.findOneAndUpdate(
            { transactionReference: transactionReference },
            { status: 'failed' }
        );

        return res.status(500).send({
            code: 1,
            message: "Erro interno do servidor: " + error.message
        });
    }
});


async function handlePaymentUsing(paymentOption, msisdn, amount, reference) {
    const credentials = {
        grant_type: 'client_credentials',
        client_id: '9d2bd2e3-76dc-44d3-b384-50bc9bac70b0',
        client_secret: 'k8m7Emdii91Z6e4VQ2nlvfuAatzd2JwjSbgAljMK',
        emola_wallet_id: 'sua_emola_wallet_id',
        mpesa_wallet_id: '970358',
    };

    const tokenCredentials = {
        grant_type: credentials.grant_type,
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
    };

    // Passo 1: Obter o token
    let token = await axios.post('https://e2payments.explicador.co.mz/oauth/token', tokenCredentials)
        .then(response => response.data.token_type + ' ' + response.data.access_token)
        .catch(error => {
            console.log('Erro ao obter o token:', error.response.data);
            return null;
        });

    if (!token) {
        return { success: false, message: "Falha ao obter o token." };
    }

    // Passo 2: Preparar o payload de pagamento
    const formData = {
        client_id: credentials.client_id,
        sms_reference: reference,
        phone: msisdn,
        amount: amount,
        reference: reference,
        fromApp: null,
    };

    const headers = {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    const ENDPOINT = (paymentOption === 'Mpesa')
        ? `https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/${credentials.mpesa_wallet_id}`
        : `https://e2payments.explicador.co.mz/v1/c2b/emola-payment/${credentials.emola_wallet_id}`;

    // Passo 3: Realizar a transação
    return await axios.post(ENDPOINT, formData, { headers })
        .then(response => {
            if (response.status === 200) {
                // Transação bem-sucedida
                return {
                    success: true,
                    transactionId: response.data.transaction_id,
                    conversationId: response.data.conversation_id,
                    thirdPartyReference: response.data.third_party_reference,
                };
            }
            return { success: false, message: "Erro ao processar pagamento." };
        })
        .catch(error => {
            console.log('Erro no pagamento:', error.response.data);
            return { success: false, message: "Erro na transação de pagamento." };
        });
}

  
module.exports = router;
