require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

const User = require('./models/User')

app.get('/', (req, res) => {
    res.status(200).json({'msg': 'Bem vindo a nossa API!'})
})


app.post('/auth/register', async(req, res) => {

    const {name, email, password, confirmPassword} = req.body

    // validation
    if (!name) {
        return res.status(422).json({msg: 'The name is required!'})
    }

    if (!email) {
        return res.status(422).json({msg: 'The email is required!'})
    }

    if (!password) {
        return res.status(422).json({msg: 'The password is required!'})
    }

    if(password !== confirmPassword) {
        return res.status(422).json({msg: 'The confirm password is not correct'})
    }

    // check if user exists
    const userExists = await User.findOne({ email: email })

    if(userExists){
        return res.status(422).json({msg: 'Please, use another email.'})
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
        name,
        email,
        password: passwordHash,
        level: 0,
        xp: 0
    })

    try {
        await user.save()

        res.status(201).json({msg: 'User created sucessfully'})

    } catch(error){
        res.status(500).json({msg: error})
    }
})


app.post('/auth/login', async (req, res) => {
    const {email, password} = req.body

    if (!email) {
        return res.status(422).json({msg: 'O email é obrigatório!'})
    }

    if (!password) {
        return res.status(422).json({msg: 'A password é obrigatório!'})
    }

    // check if user exists
    const user = await User.findOne({ email: email })

    if(!user){
        return res.status(404).json({msg: 'Usuário não encontrado!'})
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword){
        return res.status(422).json({msg: 'Senha inválida!'})
    }

    try {
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user._i,
        }, secret,)

        res.status(200).json({msg: "Autenticação realizada com sucesso", token})

    } catch(err){
        res.status(500).json({msg: err})
    }
})


app.get('/user/:id', checkToken, async (req,res) => {
    const id = req.params.id

    // excluindo a senha do usuario do retorno na busca (-password)
    const user = await User.findById(id, '-password')

    if (!user){
        return res.status(404).json({msg: 'User not found'})
    }

    return res.status(200).json({ user })
})


// Rota para adicionar XP ao usuário
app.post('/users/:id/xp', checkToken, async (req, res) => {
    const userId = req.params.id;
    const { xp } = req.body; // XP que será adicionado
  
    try {
      // Verifica se o valor de XP é um número válido
      if (typeof xp !== 'number' || xp <= 0) {
        return res.status(400).json({ message: 'XP inválido' });
      }
  
      // Encontra e atualiza o usuário
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { xp: xp } },  // $inc adiciona o valor de xp
        { new: true }          // Retorna o documento atualizado
      );
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      res.json({ message: `XP atualizado com sucesso!`, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar XP' });
    }
});


function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({msg: 'Forbidden'})
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()
        
    } catch(error){
        res.status(400).json({msg: 'Invalid token'})
    }
    
}

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@authjwtyoutube.rmuxv.mongodb.net/?retryWrites=true&w=majority&appName=AuthJwtYoutube`).then(() => {
    app.listen(3001)
    console.log('Connected to database')
}).catch((err) => console.log(err))

app.listen(3000)