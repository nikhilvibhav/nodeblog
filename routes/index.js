var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog')
var router = express.Router();

/* Homepage blog posts. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');

	// Put conditions within the curly braces
	posts.find({}, {}, function(error, posts) {
		res.render('index', {
			"posts": posts
		});
	});
});

module.exports = router;
