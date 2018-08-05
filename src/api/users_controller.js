const schemas = require('../validation/ajv/ajv_schemas');
const { Criteria, Schema } = require('../types/base');
const { User, userSchema } = require('../types/user');

const SchemaPartials = {
	skip: {
		properties: {
			skip: {
				description: 'Skip this many records in the result set',
				type: 'integer',
				minValue: 0,
			},
		},
		errorMessage: {},
	},
	limit: {
		properties: {
			skip: {
				description: 'Limit result set to this many records',
				type: 'integer',
				minValue: 0,
			},
		},
	},
};

const updateUserSchema = userSchema.withOnly('id', 'created_at', 'deleted_at');
const createUserSchema = updateUserSchema.withRequired('full_name', 'email', 'password');
const userResultSchema = userSchema.without('password', 'deleted_at');

class UserListCriteria extends Criteria {
	constructor(source) {
		super();

		this.skip = undefined;
		this.limit = undefined;

		this.assign(source);
	}
}

const userListCriteriaSchema = Schema.basedOn(UserListCriteria).refine(
	SchemaPartials.skip,
	SchemaPartials.limit
);

function usersController(server) {
	server.get(
		'/api/users',
		{
			description: 'List users',
			request: userListCriteriaSchema,
			response: {
				description: 'List of users matching criteria',
				schema: userResultSchema.arrayOf(),
			},
		},
		ctx => {
			return [];
		}
	);

	server.get(
		'/api/users/:userId',
		{
			description: 'Get a specific user',
			request: {
				userId: {
					description: 'User id',
					type: 'integer',
				},
			},
			response: {
				description: 'Single user with given id',
				schema: userResultSchema,
			},
		},
		ctx => {
			return [];
		}
	);

	server.post(
		'/api/users',
		{
			description: 'Create a new user',
			produces: 'application/json',
		},
		ctx => {
			return {
				status: true,
			};
		}
	);
}

module.exports = usersController;
