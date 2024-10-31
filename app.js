require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('./config/db'); // db connection
const checkToken = require('./middleware/authMiddleware')

const app = express();
app.use(express.json());
app.use(cors());

// Rotas
app.get('/token', checkToken, async (req, res) => {
    return res.status(200).json({ 'msg': 'token validated' });
});

app.use('/', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/interest', require('./routes/interestRoutes'));



// Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
