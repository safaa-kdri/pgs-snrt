// src/controllers/logController.js
const AuditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');

const getLogs = asyncHandler(async (req, res) => {
  const { page, limit, userId, action, module, startDate, endDate, search } = req.query;
  const result = await AuditService.getLogs({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    userId,
    action,
    module,
    startDate,
    endDate,
    search
  });

  return res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

const getRecentLogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const logs = await AuditService.getRecentLogs(limit);

  return res.status(200).json({
    success: true,
    data: logs
  });
});

module.exports = { getLogs, getRecentLogs };