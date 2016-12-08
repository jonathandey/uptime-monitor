var express = require('express');
var router = express.Router();
var yaml = require('js-yaml');

var Site = require('../models/site');

// Todo: Add optional basic auth (middleware?)

router.get('/sites', function(req, res, next) {
	res.send(new Site().all().toJson());
});

router.post('/site', function(req, res, next) {
	var url = req.body.url.trim();
	var interval = parseInt(req.body.interval) || 300000;

	// Todo: Ensure it is a valid URL

	var site = new Site

	if(url && !site.exists(url, false))
	{
		site.create({
			url: url,
			interval: interval
		});

		return res.json({ status: 'success' });
	}

	return res.json({ status: 'error', 'msg': 'site exists' });
});

router.patch('/site/:id', function(req, res, next) {

	var site = new Site().find(req.params.id);

	if(site === null)
	{
		return res.json({ status: 'error' });
	}

	site.update({interval: 60000});

	return res.json({ status: 'success' });

});

// Todo: Update a webiste

// Todo: Show recent logs for site

module.exports = router;
