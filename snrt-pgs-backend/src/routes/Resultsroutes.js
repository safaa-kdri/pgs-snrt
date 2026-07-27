// src/routes/resultsRoutes.js
const express = require('express');
const resultsController = require('../controllers/resultsController');
const { optionalAuthenticate } = require('../middlewares/auth');

const router = express.Router();


router.get('/', optionalAuthenticate(), resultsController.getResults);
router.get('/:id', optionalAuthenticate(), resultsController.getResultDetail);

module.exports = router;