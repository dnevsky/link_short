const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()


// /api/auth

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Некорректный email').exists().withMessage('Email обязателен!').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов').exists().withMessage('Пароль обязателен!').isLength({min: 6})
    ],
    async (req, res) => {
    try {
        console.log(req.body)
        
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array({onlyFirstError: true}),
                message: "Некорректные данные при регистрации"
            })
        }

        const {email, password} = req.body

        const cand = await User.findOne({email})

        if (cand) {
            return res.status(400).json({message: 'Такой пользователь уже существует.'})
        }

        const hashedPass = await bcrypt.hash(password, 12)
        const user = new User({email: email, password: hashedPass})

        await user.save()

        res.status(201).json({message: 'Пользователь создан.'})

    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так, попробуйте снова.'})
        console.log(e)
    }
})

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').exists().withMessage('Email обязателен!').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try {
        console.log(req.body)

        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Некорректные данные при входе в систему"
            })
        }

        const {email, password} = req.body
        
        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({message: 'Пользователь не найден'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({message: 'Неверный пароль или email.'})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})

    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так, попробуйте снова.'})
        console.log(e)
    }
})

module.exports = router