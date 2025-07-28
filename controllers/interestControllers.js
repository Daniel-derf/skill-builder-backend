const User = require("../models/User");
const fs = require("fs").promises;
const { increaseUserXP } = require("./userControllers");

const getInterests = async (req, res) => {
  try {
    const data = await fs.readFile("./tasks.json", "utf-8");
    const json = JSON.parse(data);

    const interests = json.interests.map((interest) => ({
      id: interest.id,
      name: interest.name,
    }));

    return res.status(200).json({ interests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching interests" });
  }
};

const getInterestTasks = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  try {
    const data = await fs.readFile("./tasks.json", "utf-8");
    const json = JSON.parse(data);

    const interest = json.interests.find((interest) => interest.id == id);
    if (!interest) {
      return res.status(404).json({ message: "No tasks found for this interest" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tasksWithCompletionStatus = interest.tasks.map((task) => {
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
    return res.status(500).json({ message: "Error fetching tasks" });
  }
};

const finishInterestTask = async (req, res) => {
  const { id, taskId } = req.params;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = await fs.readFile("./tasks.json", "utf-8");
    const json = JSON.parse(data);

    const interest = json.interests.find((interest) => interest.id == id);
    if (!interest) {
      return res.status(404).json({ message: "Interest not found" });
    }

    const task = interest.tasks.find((task) => task.id == taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (user.interests.has(id)) {
      const userInterest = user.interests.get(id);

      if (Array.isArray(userInterest)) {
        if (userInterest.includes(taskId)) return res.status(200).json({ message: "Task already completed" });
      }
    }

    const xp = task.xp;
    increaseUserXP({ userId, xp, res });

    if (!user.interests.has(id)) {
      user.interests.set(id, [taskId]);
    } else {
      user.interests.get(id).push(taskId);
    }

    await user.save();

    return res.status(200).json({ message: "Task completed successfully" });
  } catch (error) {
    console.error("Error completing task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getInterests,
  getInterestTasks,
  finishInterestTask,
};
