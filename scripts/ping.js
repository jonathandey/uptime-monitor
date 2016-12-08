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
	var siteID = site.getKey();
	var url = site.getAttribute('url');
	var interval = site.getAttribute('interval');

	request({ url: url, time: true, headers: { 
			'User-Agent': 'UpTime Monitor', 
			'X-UPTIME-INTERVAL': interval
		},
		timeout: 1500
	}, function(error, response, body)
	{
		if(error && error.code == 'ETIMEDOUT' && error.connect === true)
		{
			winston.log('error', 'connection timeout', {
				id: siteID,
				url: url
			});

			sendSiteDownNotification(site);

			return;
		}

		if(error)
		{
			console.log(error);

			return;
		}

		// No error has occured with the request. Log it!
		var logDetail = { 
			id: siteID,
			url: url,
			status: response.statusCode, 
			responseTime: response.elapsedTime,
			time: response.responseStartTime 
		};

		if(response.statusCode !== 200)
		{
			winston.log('error', 'not ok', logDetail);

			// Send alert
			sendSiteDownNotification(site);
			
			return;
		}

		winston.log('info', 'ping', logDetail);
		
		return;
	});
}

function sendSiteDownNotification(site)
{
	new Notification(new SiteDownNotification(site)).send();	
}

function loadSites()
{
	var sites = new Site().all();

	// console.log(loadedSites);

	sites.forEach(function(site)
	{
		var id = site.getKey();

		if(!loadedSites[id])
		{
			loadedSites[id] = site;

			if(site.getAttribute('pause') === true)
			{
				return;
			}

			pingSite(site);
			startSiteInterval(site);
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

	for(siteID in loadedSites)
	{
		var site = new Site().find(siteID);
		var currentLoadedSite = loadedSites[siteID]; // currently loaded site config

		// Purge the site if it no longer exists
		if(!site)
		{
			return purgeSite(currentLoadedSite);
		}

		// diff changes
		if(JSON.stringify(currentLoadedSite) != JSON.stringify(site))
		{
			console.log('Found changes for ' + site.getAttribute('url'));
			loadedSites[siteID] = site;
		}

		if(site.getAttribute('pause') === true &&
			sitePings[siteID])
		{
			clearSiteInterval(site);
		}
		
		if(site.getAttribute('pause') === false &&
			! sitePings[siteID])
		{
			startSiteInterval(site);
		}

		// Update site interval
		if(site.getAttribute('pause') === false &&
			sitePings[siteID] &&
			(currentLoadedSite.getAttribute('interval') && 
				currentLoadedSite.getAttribute('interval') != site.getAttribute('interval')
			)
		)
		{
			console.log('Updating ping interval for ', site.getAttribute('url'))
			clearSiteInterval(site);
			startSiteInterval(site);
		}
	};
}

function purgeSite(site)
{
	console.log('purging url ' + site.getAttribute('url'));
	clearSiteInterval(site);
	delete loadedSites[site.getKey()];

	return;	
}

function startSiteInterval(site)
{
	var id = site.getKey();

	console.log('starting ping for ' + site.getAttribute('url'));
	return sitePings[id] = setInterval(function()
	{
		pingSite(site);
	}, site.getAttribute('interval'));
}

function clearSiteInterval(site)
{
	console.log('stopping ping for ' + site.getAttribute('url'));
	clearInterval(sitePings[site.getKey()]);
	delete sitePings[site.getKey()];

	return;
}

loadSites();