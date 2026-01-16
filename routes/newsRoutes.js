const express = require('express');
const router = express.Router();
const {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    addComment,
} = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNews).post(protect, createNews);
router.route('/:id').get(protect, getNewsById).put(protect, updateNews).delete(protect, deleteNews);
router.route('/:id/comment').patch(protect, addComment);

module.exports = router;
