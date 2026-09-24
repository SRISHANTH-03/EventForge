const Task = require('../models/Task');
const { logAudit } = require('../middleware/audit');

exports.getTasks = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, priority, category } = req.query;

    const query = { eventId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .populate('ownerId', 'name email avatar')
      .populate('volunteerId', 'name email role')
      .sort({ dueAt: 1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, dueAt, priority = 'Medium', status = 'Not Started', location, category, ownerId, volunteerId } = req.body;

    if (!title || !dueAt) {
      return res.status(400).json({ success: false, error: 'Task title and due date/time are required.' });
    }

    const task = await Task.create({
      eventId,
      title: title.trim(),
      description: description || '',
      dueAt,
      priority,
      status,
      location: location || '',
      category: category || 'Operations',
      ownerId: ownerId || null,
      volunteerId: volunteerId || null,
    });

    const populated = await Task.findById(task._id)
      .populate('ownerId', 'name email avatar')
      .populate('volunteerId', 'name email role');

    await logAudit({
      actorId: req.user?._id,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task._id,
      details: { title: task.title, priority: task.priority },
    });

    res.status(201).json({ success: true, task: populated, message: 'Task created.' });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
      .populate('ownerId', 'name email avatar')
      .populate('volunteerId', 'name email role');

    if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });

    res.status(200).json({ success: true, task, message: 'Task updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task removed.' });
  } catch (err) {
    next(err);
  }
};
