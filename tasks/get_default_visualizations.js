var models = require('../app/models');
var Q = require('q');
var _ = require('lodash');
var config = require('../config/config');
var defaultVisualizations = config.defaultVisualizations || [];
require('colors');
var npm = require('npm');
var debug = require('debug')('lightning:server:tasks');
var utils = require('../app/utils');

var getDefaultVisualizations = function(cb) {

    debug('\nInstalling default visualizations from npm. This may take a minute or two...'.green);

    Q.all(_.map(defaultVisualizations, function(moduleName) {
        return models.VisualizationType.createFromPreinstalled(moduleName);
    }))
    .spread(function() {
        debug()
        var vizTypes = Array.prototype.slice.call(arguments, 0);
        debug('Created Viz Types: ' + _.pluck(vizTypes, 'name').join(', '));
        cb && cb();
    }).catch(function(err) {
        debug(err);
        cb && cb(err);
    });

};


if (require.main === module) {
    // code run only if this file is called
    // directly from the command line
    var models = require('../app/models');
    models.sequelize.sync({force: false})
        .then(function() {
            models.VisualizationType
                .findAll()
                .then(function(vizTypes) {
                    if(vizTypes.length === 0) {
                        npm.load(utils.getNPMConfig(), function() {
                            getDefaultVisualizations();
                        });
                    }
                });
        });
}
else {
    // expose functions if this file has been
    // required from elsewhere
    module.exports = getDefaultVisualizations;
}
