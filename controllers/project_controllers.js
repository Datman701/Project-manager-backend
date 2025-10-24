import Project from '../models/project.js'
import User from '../models/user.js'
import Task from '../models/task.js'

export const createProject = async (req, res) => {
  const { title, description, dueDate, status, priority } = req.body;

  try {
    if (!title || !description) {
      return res.status(400).json({ message: "Project title and description are required" });
    }

    let dueDateValue = null;
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      dueDateValue = dueDate;
    }

    const newProject = await Project.create({
      title,
      description,
      createdBy: req.userId,
      members: [req.userId],
      dueDate: dueDateValue,
      status: status || 'active',
      priority: priority || 'medium'
    });

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.userId },
        { members: { $in: [req.userId] } }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

    return res.status(200).json(projects);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isCreator = project.createdBy._id.toString() === req.userId;
    const isMember = project.members.some(member => member._id.toString() === req.userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: "Not authorized to view this project" });
    }

    return res.status(200).json({ project });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, status, priority } = req.body;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.userId !== project.createdBy._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (status) updatedFields.status = status;
    if (priority) updatedFields.priority = priority;

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      updatedFields.dueDate = dueDate;
    }

    const updatedProject = await Project.findByIdAndUpdate(projectId, updatedFields, { new: true })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(200).json(updatedProject);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.userId !== project.createdBy.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({ message: "Project deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  const { email } = req.body;
  const { projectId } = req.params;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email address" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Only project creator can add members" });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member of this project" });
    }

    project.members.push(user._id);
    await project.save();

    user.projects.push(projectId);
    await user.save();

    const populatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      message: "Member added successfully",
      project: populatedProject
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMembers = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isCreator = project.createdBy.toString() === req.userId;
    const isMember = project.members.some(member => member._id.toString() === req.userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: "Not authorized to view project members" });
    }

    return res.status(200).json(project.members);

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMember = async (req, res) => {
  const { userId } = req.body;
  const { projectId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Only project creator can remove members" });
    }

    if (!project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is not a member of this project" });
    }

    if (user._id.toString() === project.createdBy.toString()) {
      return res.status(400).json({ message: "Project creator cannot be removed from the project" });
    }

    // Remove member from project
    project.members = project.members.filter(memberId => memberId.toString() !== user._id.toString());
    await project.save();

    // Remove project from user's projects list
    user.projects = user.projects.filter(projId => projId.toString() !== projectId.toString());
    await user.save();

    // Handle task cleanup - Delete tasks assigned to or created by the removed user in this project
    const tasksToDelete = await Task.find({
      projectId: projectId,
      $or: [
        { assignedTo: user._id },     // Tasks assigned to the removed user
        { createdBy: user._id }       // Tasks created by the removed user
      ]
    });

    // Delete the tasks
    if (tasksToDelete.length > 0) {
      await Task.deleteMany({
        projectId: projectId,
        $or: [
          { assignedTo: user._id },
          { createdBy: user._id }
        ]
      });
    }

    return res.status(200).json({
      message: "Member removed successfully",
      tasksDeleted: tasksToDelete.length
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};