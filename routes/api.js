var express = require('express');
var router = express.Router();
var yaml = require('js-yaml');

var Site = require('../models/site');

/* GET home page. */
router.get('/sites', function(req, res, next) {
	var sites = [];

	Site.all().forEach(function(str)
	{
		sites.push(Site.decodeUrl(str));
	});

	res.json(sites);
});

router.post('/site', function(req, res, next) {
	var url = req.body.url.trim();
	var interval = parseInt(req.body.interval) || 300000;

	if(url && !Site.exists(url))
	{
		var data = yaml.safeDump({ url: url, interval: interval });

		Site.create(url, data);
		return res.json({ status: 'success' });
	}

	return res.json({ status: 'error', 'msg': 'site exists' });
});

module.exports = router;
