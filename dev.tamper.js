// ==UserScript==
// @id             iitc-plugin-dev
// @name           IITC plugin: DEV
// @category       Layer
// @version        1.0
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Do stuff
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

var script = document.createElement('script');
script.src = 'http://localhost:8080/plugin.user.js';
document.body.appendChild(script);
