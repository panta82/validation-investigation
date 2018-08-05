const { Model, Schema } = require('./base');

class User extends Model {
	constructor(source) {
		super();

		/**
		 * Uniue user id
		 * @type {undefined}
		 */
		this.id = undefined;

		/**
		 * Full user name and surename, if feasible
		 * @type {string}
		 */
		this.full_name = undefined;

		/**
		 * Email address. Must be unique in the system
		 * @type {string}
		 */
		this.email = undefined;

		/**
		 * Password to set
		 * @type {string}
		 */
		this.password = undefined;

		/**
		 * Date when user was created
		 * @type {Date}
		 */
		this.created_at = undefined;

		/**
		 * Date when user was deleted (if ever)
		 * @type {undefined}
		 */
		this.deleted_at = undefined;

		this.assign(source);
	}

	static _schema() {
		const base = {
			properties: {
				full_name: true,
				email: {
					format: 'email',
				},
				password: {
					minLength: 3,
					errorMessage: 'Password must be at least 3 characters long',
				},
				created_at: true,
			},
			errorMessage: {
				required: {
					full_name: 'Full name is required',
					email: 'Email is required',
					password: 'Password is required',
				},
			},
		};

		return /** @alias User.schema */ {
			forResult: {
				...base,
				properties: '*',
			},
			forCreate: {
				...base,
				properties: {},
			},
		};
	}
}

// *********************************************************************************************************************

const userSchema = Schema.basedOn(User).refine({
	properties: {
		email: {
			format: 'email',
			errorMessage: 'Email must be a valid email address',
		},
		password: {
			minLength: 3,
			errorMessage: 'Password must be at least 3 characters long',
		},
	},
	errorMessage: {
		required: {
			full_name: 'Full name is required',
			email: 'Email is required',
			password: 'Password is required',
		},
	},
});

module.exports = {
	User,

	userSchema,
};
