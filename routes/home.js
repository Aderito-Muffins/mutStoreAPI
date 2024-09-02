const express = require('express');
const router = express.Router();

// Rota para o método GET na raiz
router.get('/', (req, res) => {
  res.send('<h1 style="color: #4CAF50; text-align: center;">BEM VINDO MUFFINS SERVICES API</h1>' +
           '<p style="text-align: center; font-size: 1.2em;">Seu ponto de partida para uma experiência inovadora!</p>');
});

// Rota para o método POST na raiz
router.post('/', (req, res) => {
  res.send('<h1 style="color: #4CAF50; text-align: center;">BEM VINDO MUFFINS SERVICES API</h1>' +
           '<p style="text-align: center; font-size: 1.2em;">Seu ponto de partida para uma experiência inovadora!</p>');
});

module.exports = router;
