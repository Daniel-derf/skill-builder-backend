require('dotenv').config();
const fs = require('fs').promises;
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const User = require('./models/User');

app.get('/', (req, res) => {
    res.status(200).json({ 'msg': 'Welcome to our API!' });
});

app.get('/token', checkToken, async (req, res) => {
    return res.status(200).json({ 'msg': 'token validated' });
});

app.post('/user/register', async (req, res) => {
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
});

app.post('/user/login', async (req, res) => {
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
});

app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.userId

    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({ user });
});

app.get('/user/me', checkToken, async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({ user });
});

app.post('/user/:id/xp', checkToken, async (req, res) => {
    const userId = req.params.id;
    const { xp } = req.body;

    try {

        if (typeof xp !== 'number' || xp <= 0) {
            return res.status(400).json({ message: 'Invalid XP' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { xp: xp } }, 
            { new: true }          
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: `XP updated successfully!`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating XP' });
    }
});

app.get('/interest', checkToken, async (req, res) => {
    try {

        const data = await fs.readFile('./tasks.json', 'utf-8');
        const json = JSON.parse(data);

        const interests = json.interests.map((interest) => ({
            id: interest.id,
            name: interest.name 
        }));

        return res.status(200).json({ interests });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching interests' });
    }
});

app.get('/interest/:id/task', checkToken, async (req, res) => {
    const id = req.params.id;
    const userId = req.userId;

    try {
        const data = await fs.readFile('./tasks.json', 'utf-8');
        const json = JSON.parse(data);

        const interest = json.interests.find(interest => interest.id == id);
        if (!interest) {
            return res.status(404).json({ message: 'No tasks found for this interest' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tasksWithCompletionStatus = interest.tasks.map(task => {
            const userInterest = user.interests.get(id);

            const completed = userInterest ? userInterest.includes(task.id) : false;

            return {
                ...task,
                completed,
            };
        });

        return res.status(200).json({ tasks: tasksWithCompletionStatus });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching tasks' });
    }
});

app.post('/interest/:id/task/:taskId/finish', checkToken, async (req, res) => {
    const { id, taskId } = req.params;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const data = await fs.readFile('./tasks.json', 'utf-8');
        const json = JSON.parse(data);

        const interest = json.interests.find(interest => interest.id == id);
        if (!interest) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        const task = interest.tasks.find(task => task.id == taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (user.interests.has(id)) {
            const userInterest = user.interests.get(id);
        
            if (Array.isArray(userInterest)) {
                if (userInterest.includes(taskId))
                    return res.status(200).json({ message: 'Task already completed' });
            }
        }

        user.xp += task.xp;

        if (!user.interests.has(id)) {
            user.interests.set(id, [taskId]); 
        } else {
            user.interests.get(id).push(taskId);
        }

        await user.save();

        return res.status(200).json({ message: 'Task marked as completed', interests: user.interests, userXp: user.xp });
    } catch (error) {
        console.error('Error completing task:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Forbidden' });
    }

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);

        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(400).json({ msg: 'Invalid token' });
    }
}

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbURL = process.env.DB_URL;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}${dbURL}`).then(() => {
    app.listen(3001);
    console.log('Connected to database');
}).catch((err) => console.log(err));
