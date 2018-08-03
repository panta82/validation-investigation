'use strict';

const { expect } = require('chai');

const { Model } = require('../src/types/base');

describe('Model', () => {
  describe('schema', () => {
    it('can generate default schema', () => {
      class Bare extends Model {
        constructor(source) {
          super();

          /**
           * Some property
           * @type {string}
           */
          this.a = 'a';

          /**
           * Circular reference
           * @type {Bare}
           */
          this.b = 'b';

          this.assign(source);
        }
      }

      expect(Bare.schema).to.eql({
        $id: 'Bare',
        properties: {
          a: {
            description: 'Some property',
            type: 'string',
          },
          b: {
            $ref: 'Bare',
            description: 'Circular reference',
          },
        },
      });
    });

    it('can combine supplied spec and default schema', () => {
      class MyModel extends Model {
        constructor(source) {
          super();

          /**
           * Some prop with type
           * @type {string}
           */
          this.a = 'a';

          /**
           * Other prop without type
           */
          this.b = 'b';

          this.assign(source);
        }

        static _schema() {
          return {
            description: 'This is MyModel',
            properties: {
              a: {
                description: 'Changed desc',
              },
              b: {
                $ref: 'AddedType',
              },
            },
          };
        }
      }

      expect(MyModel.schema).to.eql({
        $id: 'MyModel',
        description: 'This is MyModel',
        properties: {
          a: {
            description: 'Changed desc',
            type: 'string',
          },
          b: {
            $ref: 'AddedType',
            description: 'Other prop without type',
          },
        },
      });
    });

    it('can generate multi-schema result', () => {
      class MyMultiModel extends Model {
        constructor(source) {
          super();
          this.a = 'a';
          this.b = 'b';
          this.assign(source);
        }

        static _schema() {
          const base = {
            description: 'This is My MULTI Model',
            errorMessage: {
              required: {
                a: 'A is required',
                b: 'B is required',
              },
            },
          };

          return /** @alias MyMultiModel.schema */ {
            base,
            forCreate: {
              ...base,
              description: 'My MULTI model for create',
              required: ['a', 'b'],
            },
          };
        }
      }

      expect(MyMultiModel.schema).to.eql({
        base: {
          $id: 'MyMultiModel/base',
          description: 'This is My MULTI Model',
          properties: {
            a: {},
            b: {},
          },
          errorMessage: {
            required: {
              a: 'A is required',
              b: 'B is required',
            },
          },
        },
        forCreate: {
          $id: 'MyMultiModel/forCreate',
          description: 'My MULTI model for create',
          properties: {
            a: {},
            b: {},
          },
          required: ['a', 'b'],
          errorMessage: {
            required: {
              a: 'A is required',
              b: 'B is required',
            },
          },
        },
      });
    });

    it('will prevent creation of schema that specifies non-existent properties', () => {
      class SmallModel extends Model {
        constructor(source) {
          super();
          this.a = 'a';
          this.assign(source);
        }

        static _schema() {
          return {
            properties: {
              b: {
                description: `B doesn't exist, we'll have to crash now`,
              },
            },
          };
        }
      }

      expect(() => SmallModel.schema).to.throw;
    });
  });
});
