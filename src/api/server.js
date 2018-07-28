const http = require('http');

const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const koaRouter = require('koa-router');

function Server(port = 3000) {
	const app = new Koa();
	const router = koaRouter();
	const routes = [];
	
	app.use(koaLogger());
	
	app.use(koaBody({
		jsonLimit: '1000kb'
	}));
	
	this.get = addHandler.bind(this, 'get');
	this.post = addHandler.bind(this, 'post');
	this.put = addHandler.bind(this, 'put');
	this.delete = addHandler.bind(this, 'delete');
	this.del = addHandler.bind(this, 'del');
	
	function addHandler(method, path, doc, handler) {
		const route = {
			method,
			path,
			doc
		};
		routes.push(route);
		
		router[method](path, (ctx) => {
			const result = handler(ctx);
			if (result instanceof Promise) {
				return result.then(body => {
					ctx.body = body;
				});
			} else {
				ctx.body = result;
			}
		});
	}
	
	this.start = () => {
		app.use(router.routes());
		
		const server = http.createServer(app.callback());
		server.listen(port, () => {
			console.log(`API is available on http://localhost:${port}/`);
		});
	};
}

module.exports = {
	Server
};