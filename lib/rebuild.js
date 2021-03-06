'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const async = require('async');

/**
 * Load the application dictionary
 */

module.exports = function () {
  const self = this;

  console.log();
  self.log.debug('Rebuilding application dictionary...');

  // Update the Strapi status (might be used
  // by the core or some hooks).
  self.reloading = true;

  // Async module loader to rebuild a
  // dictionary of the application.
  async.auto({

    // Rebuild the dictionaries.
    dictionaries: function (cb) {
      self.hooks._config.reload();
      self.hooks._api.reload();
      self.hooks._admin.reload();
      cb();
    },

    // Make sure to delete the router stack.
    router: function (cb) {
      delete self.router;
      cb();
    }
  },

  // Callback.
  function (err) {

    // Just in case there is an error.
    if (err) {
      self.log.error('Impossible to reload the server');
      self.log.error('Please restart the server manually');
      self.stop();
    }

    // Tell the application the framework is reloading
    // (might be used by some hooks).
    self.reloading = true;

    // Teardown Waterline adapters and
    // reload the Waterline ORM.
    self.log.debug('Reloading the ORM...');
    self.hooks.waterline.reload();

    // Reloading the router.
    self.log.debug('Reloading the router...');
    self.hooks.router.reload();

    // Update `strapi` status.
    self.reloaded = true;
    self.reloading = false;

    // Finally inform the developer everything seems ok.
    self.log.info('Dictionary successfully rebuilt');
    self.log.warn('You still need to restart your server to fully enjoy changes...');
    console.log();
  });
};
