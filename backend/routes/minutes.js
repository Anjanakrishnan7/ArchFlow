const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createMinutes, getProjectMinutes } = require('../controllers/minutesController');

router.use(auth);

router.post('/', createMinutes);
router.get('/project/:projectId', getProjectMinutes);
router.delete('/:id', require('../controllers/minutesController').deleteMinutes);

module.exports = router;
