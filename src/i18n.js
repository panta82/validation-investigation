const fs = require('fs');

const i18next = require('i18next');

const LANGUAGES = ['en'];
const NAMESPACE = 'common';

const resources = {};
LANGUAGES.forEach(language => {
  const translations = fs.readFileSync(__dirname + `/translations/${language}.json`);
  resources[language] = {
    [NAMESPACE]: translations
  };
});

i18next.init({
  debug: false,
  language: 'en',
  defaultNS: NAMESPACE,
  resources
});

function translate(key, options) {
  return i18next.t(key, options);
}

module.exports = translate;