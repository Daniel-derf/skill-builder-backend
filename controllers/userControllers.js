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
    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({ user });
};


const increaseUserXP = async ({userId, xp}) => {
    try {
        if (typeof xp !== 'number' || xp <= 0) {
            throw new Error("Invalid XP value")
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found")
        }

        let lastingXpToUp = user.lastingXpToUp
        lastingXpToUp -= xp

        if (lastingXpToUp <= 0){
            await increaseUserLevel(userId);
            user.xp = (lastingXpToUp* (-1))
            user.save()
            console.log("User level updated!")
            return
        }

        user.xp += xp
        user.lastingXpToUp = lastingXpToUp
        user.save()

        console.log("User XP updated successfully!")
    } catch (error) {
        console.error(error);
        throw new Error(error)
    }
};


const increaseUserLevel = async (userID) => {
    // each level requires 30% more XP than the previous one to be updated

    const user = await User.findById(userID)

    if (!user){
        throw new Error("User not found")
    }

    user.level+=1
    const initialLastingXP = 500
    const increasePerLevelUp = (initialLastingXP/100) * 30
    user.lastingXpToUp = initialLastingXP + (increasePerLevelUp * user.level)

    user.save()
}


module.exports = {
    getUserData,
    getLoggedUser,
    increaseUserXP
}