const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const authConfig = require('../../config/auth.json')
const crypto = require('crypto')

const mailer = require('../../modules/mailer')

const router = express.Router()

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

router.get('/users', async (req, res) => {

    try {
        const user = await User.find()

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id })
        })

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao pegar os usuários' })
    }
})


router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if(await User.findOne({ email })){
            return res.status(400).send({ error: 'User already exists' })
        }

        const user = await User.create(req.body)

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id })
        })
    } catch(err) {
        return res.status(400).send({ error: 'registration failed' })
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if(!user){
        return res.status(400).send({ error: 'user not found' })
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Invalid password' })
    }

    user.password = undefined;

    res.send({
        user,
        token: generateToken({ id: user.id })
    })
})

router.post('/token', async (req, res) => {

    const user = await User.find().select('+password')

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Senha inválida' })
    }

    user.password = undefined;

    res.send({
        user,
        token: generateToken({ id: user.id })
    })
})

module.exports = app => app.use('/auth', router)