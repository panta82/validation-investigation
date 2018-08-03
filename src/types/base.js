'use strict';

const lodash = require('lodash');
const Ajv = require('ajv');

const { jsonSchemaPropertiesFromClassHierarchy } = require('./schema_tools');

//**********************************************************************************************************************

class CustomError extends Error {
	constructor(message, innerError = null, code = 500) {
		if (lodash.isFinite(innerError)) {
			code = innerError;
			innerError = null;
		}

		super(message.message || message);

		this.inner_error = innerError instanceof Error ? innerError : null;
		this.code = code;
	}

	static factory(...args) {
		const Ctr = this;
		return (...factoryArgs) => {
			return new Ctr(...args, ...factoryArgs);
		};
	}
}

//**********************************************************************************************************************

function assignCustomizer(objValue, srcValue, key, object, source, stack) {
	if (lodash.isArray(objValue) && lodash.isArray(srcValue)) {
		// Arrays should overwrite default values, not merge
		return srcValue;
	}
}

class Model {
	constructor(source) {
		this.assign(source);
	}

	assign(source) {
		lodash.mergeWith(this, source, assignCustomizer);
	}

	toPOJO() {
		return Object.assign({}, this);
	}

	/**
	 * The equivalent of new Model(). Can be used in .map() and similar functions
	 * TODO: How to document this as a constructor?
	 * @constructor
	 * @template T
	 * @param {T|object} source
	 * @returns {T}
	 */
	static create(source) {
		const Ctr = this;
		return new Ctr(source);
	}

	/**
	 * Cast target into specific Model type if it isn't already of that type.
	 * It will smartly map arrays.
	 * @template T
	 * @param {T|object|Array<T>} target
	 * @returns {T}
	 */
	static cast(target) {
		if (lodash.isArray(target)) {
			return target.map(item => this.cast(item));
		}

		// When you call X.cast(), "this" will point to X (the constructor of the class into which you want to cast the object)
		const Ctr = this;
		if (target instanceof Ctr) {
			return target;
		}
		return new Ctr(target);
	}

	static get KEYS() {
		if (!this._KEYS) {
			this._KEYS = super.KEYS || {};
			const instance = new this();
			for (const key in instance) {
				if (instance.hasOwnProperty(key)) {
					this._KEYS[key] = key;
				}
			}
		}
		return this._KEYS;
	}

	/**
	 * Asserts that this model is a superset of a different model, by making sure it declares at least
	 * all the properties the other model declares
	 * @param {Object} ob enum or object with properties to check
	 */
	static assertSuperset(ob) {
		for (const key in ob) {
			if (ob.hasOwnProperty(key) && !(key in this.KEYS)) {
				throw new ModelAssertionError(`Superset check failed for ${this.name}. Missing property: ${key}`);
			}
		}
	}

	/**
	 * Function to provide schema spec. Inheritors should override this function and provide their own details.
	 * @example
	 * return {
     *   properties: {
     *     list: {
     *       minLength: 1
     *     }
     *   }
     * };
	 *
	 * Inheritors can also provide a spec with multiple schemas.
	 * @example
	 *  return {
     *    default: {},
     *    forCreate: {
     *      required: ['username', 'password']
     *    }
     *  };
	 */
	static _schema() {}

	/**
	 * Get JSON schema or object with multiple schemas for this model.
	 */
	static get schema() {
		if (this._SCHEMA) {
			return this._SCHEMA;
		}

		const properties = jsonSchemaPropertiesFromClassHierarchy(this);
		const spec = this._schema();

		let result;

		if (!spec || spec.description || spec.properties || spec.$id || spec.required || spec.errorMessage) {
			// Presume this is single schema
			result = makeSchema(this.name, properties, spec);
		} else {
			// Presume this is an object with multiple schemas at different keys
			result = {};
			for (const key in spec) {
				result[key] = makeSchema(`${this.name}/${key}`, properties, spec[key]);
			}
		}

		this._SCHEMA = result;
		return result;
	}
}

function makeSchema(name, properties, spec) {
	spec = spec || {};

	if (spec.properties) {
		// Validate that no custom property has been given that actually doesn't exist on the detected props
		for (const key in spec.properties) {
			if (!properties[key]) {
				throw new InvalidSchemaPropertyError(key);
			}
		}
	}

	// TODO We will create a valid schema even without a spec and include all properties we find.
	// TODO We'll probably want to make this a bit stricter. Require Model implementer to
	// TODO either add jsdoc annotation or define exactly which properties they want included in spec.

	const schema = lodash.merge(
		{
			$id: name,
			properties,
		},
		spec
	);

	return schema;
}

class ModelAssertionError extends CustomError {}

class InvalidSchemaPropertyError extends CustomError {
	constructor(property, Class) {
		super(`Tried to describe schema property "${property}", but model "${Class.name}" doesn't seem to define it`);
	}
}

/**
 * Go through prototype chain of the given type and gather all the static properties.
 * The result is a single hash with all the properties merged. Overwriting follows the inheritance rules.
 * @param {function} Class class to recurse
 * @param {string} propName Prop to aggregate
 */
function gatherStatics(Class, propName) {
	const hashes = [];
	while (Class.prototype) {
		let val = Class[propName];
		if (lodash.isString(val)) {
			val = { [val]: val };
		} else if (lodash.isArray(val)) {
			val = lodash.keyBy(val);
		}
		if (lodash.isPlainObject(val)) {
			hashes.unshift(val);
		}
		Class = Object.getPrototypeOf(Class);
	}

	if (!hashes.length) {
		return undefined;
	}

	hashes.unshift({});
	return lodash.merge.apply(lodash, hashes);
}

//**********************************************************************************************************************

class Criteria extends Model {
	_set(ob, sourceKey, targetKey, cast = null) {
		if (!ob || !(targetKey in this)) {
			return;
		}

		let val = ob[sourceKey];
		if (!val) {
			return;
		}

		if (val === 'null') {
			val = null;
		}

		if (cast) {
			val = cast(val);
		}

		if (isNaN(val)) {
			val = undefined;
		}

		this[targetKey] = val;
	}

	setFromPassport(/** Passport */ passport) {
		this._set(passport, 'user_id', 'user_id', Number);
	}

	setFromParams(params) {}

	setFromQuery(query) {
		this._set(query, 'limit', 'limit', Number);
		this._set(query, 'after-id', 'after_id', Number);
	}

	setFromBody(body) {}

	/**
	 * Set Criteria from koa ctx object
	 * @param {HandlerCtx} ctx
	 */
	setFromRequest(ctx) {
		this.setFromBody(ctx.request.body);
		this.setFromQuery(ctx.request.query);
		this.setFromParams(ctx.params);
		this.setFromPassport(ctx.passport);
	}

	/**
	 * Create Criteria from koa ctx object
	 * @param {HandlerCtx} ctx
	 */
	static fromRequest(ctx) {
		const result = new this();
		result.setFromRequest(ctx);
		return result;
	}
}

//**********************************************************************************************************************

const ajv = new Ajv({
	allErrors: true,
	coerceTypes: true,
	removeAdditional: 'all',
	jsonPointers: true,
});

require('ajv-errors')(ajv);

/**
 * @callback validatorFactory
 * @returns ValidateFunction
 */

/**
 * Add schema into the Ajv system. Returns a factory you can use to retrieve the resulting validator function.
 * @param {object|Array<object>} def
 * @return validatorFactory
 */
function schema(def) {
	if (!def.$id) {
		++_lastAutoId;
		def.$id = '/_auto_id_/' + _lastAutoId;
	}
	const id = def.$id;

	ajv.addSchema(def);
	return () => ajv.getSchema(id);
}
let _lastAutoId = 0;

//**********************************************************************************************************************

module.exports = {
	Model,
	Criteria,
	CustomError,
	schema,
};
