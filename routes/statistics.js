const express = require('express')
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'OK, estas em /'
    })
})
router.post('/users', (req, res, next) => {
    res.status(200).send({
        mensagem: 'OK, /api/v1'
    })
})
router.delete('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'OK, /api/v1/users'
    })
})
router.put('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'OK, /api/v1/produts'
    })
})

module.exports = router;