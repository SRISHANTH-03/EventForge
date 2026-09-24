const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, actorId, action, entityType, entityId, details }) => {
  try {
    const user = req?.user;
    await AuditLog.create({
      actorId: actorId || user?._id,
      actorEmail: user?.email || 'system',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      details,
      ipAddress: req?.ip || '127.0.0.1',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLog] Failed to log action:', error.message);
  }
};

module.exports = { logAudit };
