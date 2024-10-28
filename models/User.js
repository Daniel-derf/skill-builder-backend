const mongoose = require("mongoose");

// Modelo de usuário
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Adicionando unique para evitar emails duplicados
    password: { type: String, required: true },
    xp: { type: Number, default: 0 }, // Define um valor padrão para xp
    interests: { type: Map, of: [String] } // Mantém como Map, mas com valores que são arrays de strings
});

// Cria o modelo User
const User = mongoose.model('User', UserSchema);

module.exports = User;
