const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Inicialize o Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mutstoremz.appspot.com' // Substitua pelo seu nome de bucket
});

const bucket = admin.storage().bucket();

// Configuração do multer para armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware de upload para o Firebase com pasta baseada no ID da app
const uploadToFirebase = async (req, res, next) => {
  try {
    req.file = {}; 
    req.file.firebaseUrls = []; // URLs das imagens
    req.file.iconUrl = null; // URL do ícone

    const appId = req.body.id; // Aqui o id da aplicação é recebido do body da requisição
    if (!appId) {
      return res.status(400).send({ message: 'O campo id da app é obrigatório.' });
    }

    // Verifica se o arquivo do ícone foi enviado
    if (req.files && req.files['icon'] && req.files['icon'][0]) {
      const iconFile = req.files['icon'][0];
      const iconBlob = bucket.file(`${appId}/icon-${uuidv4()}-${path.basename(iconFile.originalname)}`);
      const iconBlobStream = iconBlob.createWriteStream({
        metadata: {
          contentType: iconFile.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        iconBlobStream.on('error', (err) => reject(err));
        iconBlobStream.on('finish', async () => {
          try {
            await iconBlob.makePublic();
            req.file.iconUrl = `https://storage.googleapis.com/${bucket.name}/${iconBlob.name}`; // Adiciona a URL do ícone
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        iconBlobStream.end(iconFile.buffer);
      });
    } else {
      return res.status(400).send({ message: 'O campo icon é obrigatório.' });
    }

 // Verifica se o arquivo do o ficheiro foi enviado
 if (req.files && req.files['appFile'] && req.files['appFile'][0]) {
  const appFile = req.files['appFile'][0];
  const appBlob = bucket.file(`${appId}/app-${uuidv4()}-${path.basename(appFile.originalname)}`);
  const appBlobStream = appBlob.createWriteStream({
    metadata: {
      contentType: appFile.mimetype,
    },
  });

  await new Promise((resolve, reject) => {
    appBlobStream.on('error', (err) => reject(err));
    appBlobStream.on('finish', async () => {
      try {
        await appBlob.makePublic();
        req.file.appUrl = `https://storage.googleapis.com/${bucket.name}/${appBlob.name}`; // Adiciona a URL do ícone
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    appBlobStream.end(appFile.buffer);
  });
} else {
  return res.status(400).send({ message: 'O campo appFile é obrigatório.' });
}

    // Verifica se os arquivos de imagens foram enviados
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      const uploadPromises = req.files['images'].map(async (file) => {
        const blob = bucket.file(`${appId}/image-${uuidv4()}-${path.basename(file.originalname)}`);
        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
        });

        return new Promise((resolve, reject) => {
          blobStream.on('error', (err) => reject(err));
          blobStream.on('finish', async () => {
            try {
              await blob.makePublic();
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              req.file.firebaseUrls.push(publicUrl); // Adiciona a URL ao array
              resolve();
            } catch (error) {
              reject(error);
            }
          });

          blobStream.end(file.buffer);
        });
      });

      // Aguarda o upload de todos os arquivos de imagens
      await Promise.all(uploadPromises);
    } else {
      return res.status(400).send({ message: 'O campo images é obrigatório.' });
    }

    next();
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send({ message: 'Error uploading files' });
  }
};

// Expondo o upload de múltiplos arquivos
const uploadMultiple = upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'appFile', maxCount: 1 },{ name: 'images', maxCount: 4 }]); // 'icon' e 'images' são os nomes dos campos no formulário

module.exports = {
  upload: uploadMultiple,
  uploadToFirebase,
};
