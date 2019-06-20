module.exports = fastify => {
    fastify.post('/api/users/login', require('./apiLogin')(fastify));
    fastify.post('/api/users/list', require('./apiUsersList')(fastify));
};
