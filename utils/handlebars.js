var handlebars = require('handlebars').create();

handlebars.registerHelper('downcase', function(a) {
  return a.toLowerCase();
});

handlebars.registerHelper('upcase', function(a) {
  return a.toUpperCase();
});

module.exports = handlebars;
