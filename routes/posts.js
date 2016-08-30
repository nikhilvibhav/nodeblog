var express = require('express');
var multer = require('multer');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog')
var router = express.Router();

var upload = multer({
	dest: './public/images/uploads'
});
db.options = {
	safe: true,
	castIds: false
};

router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');
	posts.findById(req.params.id, function(err, post) {
		res.render('show', {
			'post': post
		});
	});
});

/* To GET Add Post page */
router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({}, {}, function(err, categories) {
		res.render('addpost', {
			"title": "Add Post",
			"categories": categories
		});
	});
});

/* To get form data from Add Post page via POST */
router.post('/add', upload.single('mainimage'), function(req, res, next) {

	// Get form values
	var title = req.body.title;
	var category = req.body.category;
	var body = req.body.body;
	var author = req.body.author;
	var date = new Date();

	if (req.file) {
		console.log('Uploading file ...');

		var mainImageOriginalName = req.file.originalname;
		var mainImageName = req.file.filename;
		var mainImageMime = req.file.mimetype;
		var mainImagePath = req.file.path;
		var mainImageSize = req.file.size;
	} else {
		var mainImageName = 'noimage.png';
	}

	// Form validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body is required').notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		res.render('addpost', {
			"errors": errors,
			"title": title,
			"body": body
		});
	} else {
		var posts = db.get('posts');

		// Insert to DB
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"author": author,
			"date": date,
			"mainimage": mainImageName
		}, function(err, post) {
			if (err) {
				res.send('There was an issue submitting the post');
			} else {
				req.flash('success', 'Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

/* To get form data from Add Comment section via POST */
router.post('/addcomment', function(req, res, next) {

	// Get form values
	var name = req.body.name;
	var email = req.body.email;
	var body = req.body.body;
	var postid = req.body.postid;
	var commentDate = new Date();

	// Form validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('body', 'Body is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not correct').isEmail();

	var errors = req.validationErrors();
	var posts = db.get('posts');

	if (errors) {
		posts.findById(postid, function(err, post) {
			res.render('show', {
				"errors": errors,
				"post": post
			});
		});
	} else {
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentDate": commentDate
		};
		console.log('id: ' + postid + 'type: ' + typeof postid);
		posts.update({
			"_id": postid
		}, {
			$push: {
				"comments": comment
			}
		}, function(err, doc) {
			if (err) {
				throw err;
			} else {
				req.flash('success', 'Comment Added');
				res.location('/posts/show/' + postid);
				res.redirect('/posts/show/' + postid);
			}
		});
	}
});

module.exports = router;
