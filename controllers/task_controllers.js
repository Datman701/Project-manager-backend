import Task from "../models/task.js"
import Project from "../models/project.js"
import User from "../models/user.js"

export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  const { projectId } = req.params;

  try {
    if (!title || !description || !priority || !projectId || !dueDate) {
      return res.status(400).json({ message: "Title, description, priority, project, and due date are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    const dueDateObj = new Date(dueDate);
    const now = new Date();
    const projectDueDate = new Date(project.dueDate);

    if (dueDateObj <= now) {
      return res.status(400).json({ message: "Task due date must be in the future" });
    }

    if (dueDateObj > projectDueDate) {
      return res.status(400).json({ message: "Task due date cannot be later than project due date" });
    }

    const newTask = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority,
      dueDate,
      projectId,
      assignedTo: assignedTo || req.userId,
      createdBy: req.userId
    });

    await Project.findByIdAndUpdate(
      projectId,
      { $push: { tasks: newTask._id } },
      { new: true }
    );

    const populatedTask = await Task.findById(newTask._id)
      .populate('projectId', 'title createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [
        { createdBy: req.userId },
        { members: req.userId }
      ]
    });

    const projectIds = userProjects.map(project => project._id);

    const tasks = await Task.find({
      projectId: { $in: projectIds }
    })
    .populate('projectId', 'title createdBy')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    return res.status(200).json(tasks);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    const tasks = await Task.find({ projectId })
      .populate('projectId', 'title createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId)
      .populate('projectId', 'title createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.projectId._id);
    if (project.createdBy.toString() !== req.userId && !project.members.includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }

    return res.status(200).json(task);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.projectId);
    if (req.userId !== task.createdBy.toString() && req.userId !== project.createdBy.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this task" });
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (status) updatedFields.status = status;
    if (priority) updatedFields.priority = priority;
    if (assignedTo) updatedFields.assignedTo = assignedTo;

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const projectDueDate = new Date(project.dueDate);

      if (dueDateObj <= new Date()) {
        return res.status(400).json({ message: "Task due date must be in the future" });
      }

      if (dueDateObj > projectDueDate) {
        return res.status(400).json({ message: "Task due date cannot be later than project due date" });
      }

      updatedFields.dueDate = dueDate;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatedFields, { new: true })
      .populate('projectId', 'title createdBy')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json(updatedTask);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.projectId);
    if (req.userId !== task.createdBy.toString() && req.userId !== project.createdBy.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    await Project.findByIdAndUpdate(
      task.projectId,
      { $pull: { tasks: taskId } },
      { new: true }
    );

    return res.status(200).json({
      message: "Task deleted successfully",
      deletedTask
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};