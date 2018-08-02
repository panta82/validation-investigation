

class TradesCriteria extends Criteria {
	constructor(/** TradesCriteria */ source) {
		super();

		/**
		 * I am just an idiot here
		 * @type {Number}
		 */
		this.x = 345434;

		/**
		 * I am just an idiot here
		 * @type {SomeOtherCriteria}
		 */
		this.$ = '';

		/**
		 * Filter by base instrument
		 */
		this.base = null;

		/**
		 * Filter by quote instrument
		 */
		this.quote = null;

		/**
		 * Filter by matcher or matchee user id
		 */
		this.user_id = null;

		/**
		 * Only return matches after this match_id
		 */
		this.after_id = null;

		/**
		 * Limit number of returned orders
		 */
		this.limit = null;

		/**
		 * Include saved matches, from DB
		 */
		this.include_saved = true;

		/**
		 * Include unsaved matches, from RAM
		 */
		this.include_unsaved = true;

		this.assign(source);
	}

	schema() {
		const doctrine = require('doctrine');

		const source = this.constructor.toString();

		const constructorSrc = findConstructorSrc(source);
		//console.log(constructorSrc);

		const properties = findProperties(constructorSrc);

		return {
			constructorSrc,
			properties,
		};

		function peek(source, index, testStrings) {
			if (typeof testStrings === 'string') {
				return source.substr(index, testStrings.length) === testStrings;
			}
			return testStrings.some(str => peek(source, index, str));
		}

		function eatSpace(source, index) {
			while (index < source.length) {
				const char = source[index];
				if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
					break;
				}
				index++;
			}
			return index;
		}

		function parseVariableAssignment(source, index) {
			index = eatSpace(source, index);

			if (!peek(source, index, 'this.')) {
				return null;
			}

			index += 5;

			// Eat variable
			const variableStartAt = index;
			let char;
			const A = 'A'.charCodeAt(0);
			const Z = 'Z'.charCodeAt(0);
			const a = 'a'.charCodeAt(0);
			const z = 'z'.charCodeAt(0);
			const dolar = '$'.charCodeAt(0);
			const underscore = '_'.charCodeAt(0);
			do {
				char = source.charCodeAt(index);
				index++;
			} while ((char >= A && char <= Z) || (char >= a && char <= z) || char === dolar || char === underscore);
			const variableEndAt = index - 1;

			index = eatSpace(source, index);

			if (variableEndAt > variableStartAt && peek(source, index, '=') && !peek(source, index + 1, '=')) {
				// We got an assignment
				return source.substring(variableStartAt, variableEndAt);
			}

			// Something is strange
			return null;
		}

		function findProperties(source) {
			const length = source.length;
			let jsdocStart = -1;
			let jsdocEnd = -1;

			const properties = [];

			let index = 0;

			while (index < length) {
				index = eatSpace(source, index);
				const char = source[index];
				if (!char) {
					break;
				}

				if (jsdocStart >= 0 && jsdocEnd >= 0) {
					// After JSDOC comment, we must see something like: this.value = ...
					const name = parseVariableAssignment(source, index);
					if (name) {
						// Good, we can create an assignment
						properties.push({
							name,
							doc: doctrine.parse(source.substring(jsdocStart, jsdocEnd), {
								unwrap: true,
								sloppy: true,
							}),
						});
					}
					jsdocStart = -1;
					jsdocEnd = -1;
				} else if (jsdocStart >= 0 && char === '*' && peek(source, index, '*/')) {
					// End of JSDOC comment
					index++;
					jsdocEnd = index + 1;
				} else if (char === '/' && peek(source, index, ['/**\n', '/** '])) {
					// Start of JSDOC comment
					jsdocStart = index;
				}

				index++;
			}

			return properties;
		}

		function findConstructorSrc(source) {
			let startIndex = -1;
			let endIndex = -1;
			let identation = 0;
			const length = source.length;
			for (let i = 0; i < length; i++) {
				const char = source[i];
				if (char === '{') {
					identation++;
				} else if (char === '}') {
					identation--;
					if (startIndex >= 0 && endIndex < 0 && identation === 1) {
						endIndex = i + 1;
						break;
					}
				} else if (identation === 1 && char === 'c' && peek(source, i, 'constructor(')) {
					startIndex = i;
				}
			}

			return source.substring(startIndex, endIndex);
		}
	}

	setFromParams(params) {
		super.setFromParams(params);

		this.pair = params.pair || null;
	}
}