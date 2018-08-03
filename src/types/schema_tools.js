'use strict';

const doctrine = require('doctrine');
const lodash = require('lodash');

/**
 * Go through Class and try to parse its public members and JSDoc comments into a JSON schema property hash.
 */
function jsonSchemaPropertiesFromClass(Class) {
  const classSrc = Class.toString();

  const parser = new JavascriptParser(classSrc);
  const attributes = parser.parseAttributes();

  const properties = {};
  attributes.forEach(attr => {
    const typeTag = attr.doc && attr.doc.tags.find(tag => tag.title === 'type' && tag.type);
    let typeProps = null;
    if (typeTag) {
      if (
        typeTag.type.type === 'TypeApplication' &&
        typeTag.type.expression &&
        typeTag.type.expression.name === 'Array'
      ) {
        // This is Type[] or Array<Type> tag
        typeProps = {
          type: 'array',
        };
        if (typeTag.type.applications && typeTag.type.applications.length) {
          typeProps.items = nameExpressionToSchemaType(typeTag.type.applications[0].name);
        }
      } else if (typeTag.type.type === 'NameExpression') {
        typeProps = nameExpressionToSchemaType(typeTag.type.name);
      }
    }

    properties[attr.name] = typeProps || {};
    if (attr.doc && attr.doc.description) {
      properties[attr.name].description = attr.doc.description;
    }
  });

  return properties;
}

/**
 * Recursively parse and merge all JSON schema properties from given Class and its parents, all the way up to Object.
 */
function jsonSchemaPropertiesFromClassHierarchy(Class) {
  const properties = {};
  while (Class.prototype) {
    lodash.merge(properties, jsonSchemaPropertiesFromClass(Class));
    Class = Object.getPrototypeOf(Class);
  }
  return properties;
}

/**
 * Take a JSDoc name expression like "{Number}" or "{MyClass}" and
 * return a corresponding JSON schema object ({type: "number"} or {ref: "MyClass"})
 */
function nameExpressionToSchemaType(nameExpression) {
  let lowercaseName = nameExpression.toLowerCase();

  if (lowercaseName === 'bool') {
    lowercaseName = 'boolean';
  }
  if (
    lowercaseName === 'string' ||
    lowercaseName === 'number' ||
    lowercaseName === 'boolean' ||
    lowercaseName === 'integer'
  ) {
    // These are just passed along as direct JSON schema types
    return {
      type: lowercaseName,
    };
  }

  if (lowercaseName === 'date') {
    // Use date-time format
    return {
      type: 'string',
      format: 'date-time',
    };
  }

  if (lowercaseName === 'regexp') {
    // No way to present regexp, just show it as string
    return {
      type: 'string',
    };
  }

  if (nameExpression[0] !== lowercaseName[0]) {
    // This is some kind of custom class or other schema
    return {
      $ref: nameExpression,
    };
  }

  // We don't know what's this, then
  return {};
}

//**********************************************************************************************************************

const WHITESPACE_CHARS = {
  space: ' '.charCodeAt(0),
  tab: '\t'.charCodeAt(0),
  lf: '\n'.charCodeAt(0),
  cr: '\r'.charCodeAt(0),
};

const WHITESPACE_CHAR_LIST = lodash.values(WHITESPACE_CHARS);

const VAR_CHARS = {
  A: 'A'.charCodeAt(0),
  Z: 'Z'.charCodeAt(0),
  a: 'a'.charCodeAt(0),
  z: 'z'.charCodeAt(0),
  dollar: '$'.charCodeAt(0),
  underscore: '_'.charCodeAt(0),
};

const PUNCTUATION_CHARS = {
  curly_open: '{'.charCodeAt(0),
  curly_close: '}'.charCodeAt(0),
};

class JavascriptParser {
  constructor(source) {
    this.source = source;
    this.index = 0;
    this.length = source.length;
  }

  _charCode() {
    return this.source.charCodeAt(this.index);
  }

  _peek(what, skip = 0) {
    if (typeof what !== 'string') {
      return what.some(str => this._peek(str + skip));
    }

    const length = what.length;
    for (let i = 0; i < length; i++) {
      if (what.charCodeAt(i) !== this.source.charCodeAt(i + this.index + skip)) {
        return false;
      }
    }

    return true;
  }

  _parseVariable() {
    const startAt = this.index;
    while (this.index < this.length) {
      const char = this._charCode();
      if (
        (char >= VAR_CHARS.A && char <= VAR_CHARS.Z) ||
        (char >= VAR_CHARS.a && char <= VAR_CHARS.z) ||
        char === VAR_CHARS.dollar ||
        char === VAR_CHARS.underscore
      ) {
        this.index++;
      } else {
        break;
      }
    }

    if (this.index === startAt) {
      return null;
    }

    return this.source.substring(startAt, this.index);
  }

  _eatSpace() {
    while (this.index < this.length) {
      if (WHITESPACE_CHAR_LIST.indexOf(this._charCode()) === -1) {
        break;
      }
      this.index++;
    }
  }

  _parseJSDoc() {
    if (!this._peek('/**')) {
      return null;
    }

    const startAt = this.index;
    while (this.index < this.length) {
      if (this._peek('*/')) {
        this.index += 2;
        break;
      }

      this.index++;
    }

    if (this.index === startAt) {
      return null;
    }

    const jsdocSource = this.source.substring(startAt, this.index);
    const doc = doctrine.parse(jsdocSource, {
      unwrap: true,
      sloppy: true,
    });
    return doc;
  }

  _parseAssignment() {
    if (!this._peek('this.')) {
      return null;
    }

    this.index += 5;
    const name = this._parseVariable();
    if (!name) {
      return null;
    }

    this._eatSpace();
    if (this._peek('=') && !this._peek('=', 1)) {
      // It is assignment
      return name;
    }

    // It's something else
    return null;
  }

  _enterConstructor() {
    this.index = 0;

    let depth = 0;
    let startAt = -1;
    while (this.index < this.length) {
      const char = this._charCode();
      if (char === PUNCTUATION_CHARS.curly_open) {
        depth++;
      } else if (char === PUNCTUATION_CHARS.curly_close) {
        depth--;
        if (startAt >= 0 && depth === 1) {
          this.length = this.index + 2;
          this.index = startAt;
          return true;
        }
      } else if (depth === 1 && this._peek('constructor')) {
        startAt = this.index;
      }

      this.index++;
    }

    return false;
  }

  parseAttributes() {
    let doc = null;
    const attributes = [];
    const attributesByName = {};

    if (!this._enterConstructor()) {
      return attributes;
    }

    while (this.index < this.length) {
      const startIndex = this.index;

      this._eatSpace();

      doc = this._parseJSDoc();

      this._eatSpace();

      const name = this._parseAssignment();
      if (name) {
        const attribute = { name, doc };
        if (attributesByName[name]) {
          // This is reassignment. Maybe just update doc
          attributesByName[name].doc = attributesByName[name].doc || doc;
        } else {
          attributes.push(attribute);
          attributesByName[name] = attribute;
        }
        doc = null;
      }

      if (startIndex === this.index) {
        this.index++;
      }
    }

    return attributes;
  }
}

module.exports = {
  jsonSchemaPropertiesFromClass,
  jsonSchemaPropertiesFromClassHierarchy,

  JavascriptParser,
};
