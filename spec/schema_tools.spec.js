'use strict';

const { expect } = require('chai');

const { JavascriptParser, jsonSchemaPropertiesFromClass } = require('../src/types/schema_tools');

describe('schema_tools', () => {
  describe('JavascriptParser', () => {
    it('can parse jsdoc and attributes', () => {
      class Test {
        constructor() {
          this.a = '';

          /** test */
          this.b = 'b';

          /** @something Text */
          this.c = 333;

          /** @js Loose comment */

          /** @type {Int} */
          this.d = this.c;

          /**************************************
           * Several lines now, a lot of comment
           * @hell yeah
           */
          this.e = this.f = 'e or f';

          // eslint-disable-next-line no-unused-vars
          const someVar = 'this shouldnt appear';
          // eslint-disable-next-line no-unused-vars
          function justSomeInnerCode() {
            // eslint-disable-next-line no-unused-vars
            const other = 'other';
          }

          this.g = /** for h */ this.h = this.a = 5;
        }

        Constructor() {
          this.shouldntbe = 'there';
        }
      }

      const parser = new JavascriptParser(Test.toString());

      const attributes = parser.parseAttributes();

      expect(attributes).to.eql([
        { name: 'a', doc: null },
        { name: 'b', doc: { description: 'test', tags: [] } },
        {
          name: 'c',
          doc: {
            description: '',
            tags: [
              {
                description: 'Text',
                title: 'something',
              },
            ],
          },
        },
        {
          name: 'd',
          doc: {
            description: '',
            tags: [
              {
                title: 'type',
                description: null,
                type: {
                  type: 'NameExpression',
                  name: 'Int',
                },
              },
            ],
          },
        },
        {
          name: 'e',
          doc: {
            description: '***********************************\nSeveral lines now, a lot of comment',
            tags: [
              {
                description: 'yeah',
                title: 'hell',
              },
            ],
          },
        },

        { name: 'f', doc: null },

        { name: 'g', doc: null },

        { name: 'h', doc: { description: 'for h', tags: [] } },
      ]);
    });

    it('can deal with missing constructor', () => {
      const parser = new JavascriptParser(`
        class NoConstructorMama {
          test() {
            return 'why do I exist?';
          }
        }
      `);

      expect(parser.parseAttributes()).to.eql([]);
    });
  });

  describe('jsonSchemaPropertiesFromClass', () => {
    it('can parse base types and references', () => {
      class Test {
        constructor() {
          this.a = 'without any tag';

          /**
           * Just description
           */
          this.b = 'b';

          /**
           * @type {bool} A boolean
           */
          this.c = 'c';

          /**
           * @type {string} A string
           */
          this.d = 'd';

          /**
           * @type {Number} A number
           */
          this.e = 'e';

          /**
           * @type {SomeType} Some other schema
           */
          this.f = 'f';

          /**
           * Help should still show
           * @type {invalid} Invalid type
           */
          this.g = 'g';

          /**
           * @type {Number[]} Number array
           */
          this.h = 'h';

          /**
           * @type {Array<SomeType>} Array of some types
           */
          this.i = 'i';
        }
      }

      const properties = jsonSchemaPropertiesFromClass(Test);

      expect(properties).to.eql({
        a: {},
        b: { description: 'Just description' },
        c: { type: 'boolean' },
        d: { type: 'string' },
        e: { type: 'number' },
        f: { $ref: 'SomeType' },
        g: { description: 'Help should still show' },
        h: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        i: {
          type: 'array',
          items: {
            $ref: 'SomeType',
          },
        },
      });
    });
  });
});
