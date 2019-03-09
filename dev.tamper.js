// ==UserScript==
// @id             iitc-plugin-dev
// @name           IITC plugin: DEV
// @category       Layer
// @version        1.0
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Do stuff
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

var script = document.createElement('script');
script.src = 'http://localhost:8080/plugin.user.js';
document.body.appendChild(script);
