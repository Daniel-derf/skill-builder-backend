const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userRegister = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name) {
        return res.status(422).json({ msg: 'The name is required!' });
    }

    if (!email) {
        return res.status(422).json({ msg: 'The email is required!' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'The password is required!' });
    }

    if (password !== confirmPassword) {
        return res.status(422).json({ msg: 'The confirm password is not correct' });
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
        return res.status(422).json({ msg: 'Please, use another email.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: passwordHash,
        xp: 0,
        interests: new Map(),
    });

    try {
        await user.save();
        res.status(201).json({ msg: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
};


const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: 'The email is required!' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'The password is required!' });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ msg: 'User not found!' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(422).json({ msg: 'Invalid password!' });
    }

    try {
        const secret = process.env.SECRET;

        const token = jwt.sign({
            id: user._id,
        }, secret);

        res.status(200).json({ msg: "Authentication successful", token });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};


module.exports = {
    userRegister,
    userLogin
}