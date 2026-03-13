const express = require('express');
const router = express.Router();
const { getSavedRoutes, createSavedRoute, updateSavedRoute, deleteSavedRoute } = require('../controllers/savedRouteController');

router.get('/:userId', getSavedRoutes);
router.post('/', createSavedRoute);
router.put('/:id', updateSavedRoute);
router.delete('/:id', deleteSavedRoute);

module.exports = router;
