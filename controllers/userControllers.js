const User = require('../models/User');


const getUserData = async (req, res) => {
    const id = req.userId

    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({ user });
};


const getLoggedUser = async (req, res) => {
    const id = req.userId;

    console.log('id: ', id)

    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({ user });
};


const increaseUserXP = async (req, res) => {
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
};


module.exports = {
    getUserData,
    getLoggedUser,
    increaseUserXP
}