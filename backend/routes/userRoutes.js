const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, getMe, updateUserProfile, uploadProfileImage, getUserActivity, blockUser, unblockUser, deleteUser } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-image', protect, upload.single('image'), uploadProfileImage);

// Admin only routes
router.get('/activity', protect, admin, getUserActivity);
router.post('/:id/block', protect, admin, blockUser);
router.post('/:id/unblock', protect, admin, unblockUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
