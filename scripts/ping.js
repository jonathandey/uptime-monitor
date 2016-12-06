var request = require('request');
var winston = require('winston');
var path = require('path');

var Site = require('../models/site');

var Notification = require('../notifications/Notification');
var SiteDownNotification = require('../notifications/SiteDownNotification');

var loadedSites = [];
var sitePings = [];

// Move the log storage path to app.js. Look for ENV var then fallback to default path
winston.add(winston.transports.File, { filename: path.join(__dirname, '../', 'storage/logs/sites.log') });
winston.remove(winston.transports.Console);

var siteLoader = setInterval(function() {
	updateLoadedSites();
	loadSites();
}, 10000);

function pingSite(site)
{
	var url = site.url;
	var interval = site.interval;
	var paused = site.pause;

	if(paused === true)
	{
		return;
	}

	request({ url: url, time: true, headers: { 
		'User-Agent': 'UpTime Monitor', 
		'X-UPTIME-INTERVAL': interval 
	} }, function(error, response, body)
	{
		if(error)
		{
			winston.log('error', 'error', error);
			return;
		}

		// Log the request
		var logDetail = { 
			id: Site.encodeUrl(url),
			url: url,
			status: response.statusCode, 
			responseTime: response.elapsedTime,
			time: response.responseStartTime 
		};

		if(response.statusCode !== 200)
		{
			// Send alert
			new Notification(new SiteDownNotification(site)).send();

			winston.log('error', 'down', logDetail);
			return;
		}

		winston.log('info', 'ping', logDetail);
		return;
	});
}

function loadSites()
{
	
	Site.all().forEach(function(url)
	{
		var site = Site.find(url);

		if(!loadedSites[url])
		{
			loadedSites[url] = site;

			pingSite(site);
			startSiteInterval(url, site);
		}
	});
}

function getLoadedSites()
{
	return loadedSites;
}

function updateLoadedSites()
{
	// console.log("Updating loaded sites...");

	for(url in loadedSites)
	{
		var site = Site.find(url);
		var currentLoadedSite = loadedSites[url]; // currently loaded site config

		// Purge the site if it no longer exists
		if(!site)
		{
			return purgeSite(url);
		}

		// diff changes
		if(JSON.stringify(currentLoadedSite) != JSON.stringify(site))
		{
			console.log('Found changes for ' + url);
			loadedSites[url] = site;
		}

		if(site.pause === true &&
			sitePings[url])
		{
			clearSiteInterval(url);
		}
		
		if(site.pause === false &&
			! sitePings[url])
		{
			startSiteInterval(url, site);
		}

		// Update site interval
		if(site.pause === false &&
			sitePings[url] &&
			(currentLoadedSite.interval && 
				currentLoadedSite.interval != site.interval
			)
		)
		{
			console.log('Updating ping interval for ', url)
			clearSiteInterval(url);
			startSiteInterval(url, site);
		}
	};
}

function purgeSite(url)
{
	console.log('purging url ' + url);
	clearSiteInterval(url);
	delete loadedSites[url];

	return;	
}

function startSiteInterval(url, site)
{
	console.log('starting ping for ' + url);
	return sitePings[url] = setInterval(function()
	{
		pingSite(site);
	}, site.interval);
}

function clearSiteInterval(url)
{
	console.log('stopping ping for ' + url);
	clearInterval(sitePings[url]);
	delete sitePings[url];

	return;
}

loadSites();