const mongoose = require('mongoose');

// Defina a URI de conexão
const uri = process.env.DATABASE;
// Função para conectar ao MongoDB
const connectDB = async () => {
  try {
    // Conecta ao MongoDB com as opções recomendadas
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
  }
};

// Exporta a função de conexão
module.exports = connectDB;

// Chama a função para conectar ao banco de dados
connectDB();
