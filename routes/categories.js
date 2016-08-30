var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog')
var router = express.Router();

router.get('/show/:category', function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');

	posts.find({
		category: req.params.category
	}, {}, function(err, posts) {
		res.render('index', {
			'title': req.params.category,
			'posts': posts
		});
	});
});

/* To GET Add categories */
router.get('/add', function(req, res, next) {
	res.render('addcategory', {
		"title": "Add Category"
	});
});

/* To get form data from Add Categories page via POST */
router.post('/add', function(req, res, next) {

	// Get form values
	var title = req.body.title;

	// Form validation
	req.checkBody('title', 'Title field is required').notEmpty();
	console.log('title: ' + title);
	var errors = req.validationErrors();

	if (errors) {
		res.render('addcategory', {
			"errors": errors,
			"title": title
		});
	} else {
		var categories = db.get('categories');

		// Insert to DB
		categories.insert({
			"title": title,
		}, function(err, category) {
			if (err) {
				res.send('There was an issue submitting the category');
			} else {
				req.flash('success', 'Category Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;
