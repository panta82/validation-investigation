function usersController(server) {
	
	
	server.get('/api/users', {}, ctx => {
		return [];
	});
	
	server.post('/api/users', {
	
	}, ctx => {
		return {
			status: true
		};
	});
}

module.exports = usersController;