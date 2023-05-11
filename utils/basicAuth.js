const basicAuth = (request, response) => {
    const auth = request.headers.authorization;
    if (!auth || auth.indexOf('Basic ') === -1) 
    return [null, null]
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    return credentials.split(':');
}
module.exports = { basicAuth };
