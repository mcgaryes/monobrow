// ============================================================
// === Requirments ============================================
// ============================================================

/**
 * We're using ANSI-Color specifically for use with the Logger.
 * @property color
 * @type Object
 */
var color = require("ansi-color").set;

/**
 * We're including the fs library specifically for writing
 * to our error and log files.
 * @property fs
 * @type Object
 */
var fs = require("fs");

/**
 * @property _
 * @type Object
 */
var _ = require("underscore");

/**
 * We'll use Backbone for Backbone.Events
 * @property Backbone
 * @type Object
 */
var Backbone = require("backbone");

// ============================================================
// === Variables ==============================================
// ============================================================

/**
 * @namespace Monobrow
 */
var Monobrow = module.exports = {};

/**
 * @property Constants
 * @type Object
 * @static
 */
var Constants = {};
