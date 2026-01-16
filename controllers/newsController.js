const News = require('../models/News');

// @desc    Add comment to news
// @route   PATCH /api/news/:id/comment
// @access  Protected
const addComment = async (req, res) => {
    const { text } = req.body;

    try {
        const news = await News.findById(req.params.id);

        if (news) {
            const comment = {
                text,
                user_id: req.user._id,
            };

            news.comments.push(comment);

            await news.save();
            await news.populate('comments.user_id', 'name email');
            res.status(201).json(news);
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all news
// @route   GET /api/news
// @access  Protected
const getNews = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await News.countDocuments({ ...keyword });
        const news = await News.find({ ...keyword })
            .populate('author_id', 'name email')
            .populate('comments.user_id', 'name email')
            .limit(limit)
            .skip(skip);

        res.json({
            news,
            page,
            pages: Math.ceil(count / limit),
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get news by ID
// @route   GET /api/news/:id
// @access  Protected
const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author_id', 'name email')
            .populate('comments.user_id', 'name email');

        if (news) {
            res.json(news);
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new news
// @route   POST /api/news
// @access  Protected
const createNews = async (req, res) => {
    const { title, body } = req.body;

    try {
        const news = await News.create({
            title,
            body,
            author_id: req.user._id,
        });

        res.status(201).json(news);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Protected
const updateNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (news) {
            news.title = req.body.title || news.title;
            news.body = req.body.body || news.body;

            const updatedNews = await news.save();
            res.json(updatedNews);
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Protected
const deleteNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (news) {
            await news.deleteOne();
            res.json({ message: 'News removed' });
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    addComment,
};
