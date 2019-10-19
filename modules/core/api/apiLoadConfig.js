import fs from 'fs-extra';
import secure from '../../../etc/secure.json';

const config = fs.readJSONSync(`${__dirname}/../static/etc/config.json`);

export default () => ({
    async handler(req, rep) {
        try {
            return rep.code(200)
                .send(JSON.stringify({
                    statusCode: 200,
                    config,
                }));
        } catch (e) {
            req.log.error({
                ip: req.ip,
                path: req.urlData().path,
                query: req.urlData().query,
                error: e && e.message ? e.message : 'Internal Server Error',
                stack: secure.stackTrace && e.stack ? e.stack : null
            });
            return rep.code(500).send(JSON.stringify({
                statusCode: 500,
                error: 'Internal server error',
                message: e && e.message ? e.message : null
            }));
        }
    }
});
