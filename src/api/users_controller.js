const schemas = require('../validation/ajv/ajv_schemas');

function usersController(server) {
	
	
	server.get('/api/users', {
		description: 'List users',
		query: {
			skip: {
				type: 'integer',
				description: 'Number of returned records to skip',
			},
			limit: {
				type: 'integer',
				description: 'Number of records to limit',
			}
		},
		response: {
			description: 'List of users',
			schema: {
				type: 'array',
				items: schemas.userSchema
			}
		}
	}, ctx => {
		return [];
	});
	
	server.get('/api/users/:userId', {
		description: 'Get a specific user',
		path: {
			userId: {
				description: 'User id',
				type: 'integer'
			}
		},
		response: {
			description: 'Single user with given id',
			schema: schemas.userSchema
		}
	}, ctx => {
		return [];
	});
	
	server.post('/api/users', {
		description: 'Create a new user',
		produces: 'application/json',
		
	}, ctx => {
		return {
			status: true
		};
	});
}

module.exports = usersController;