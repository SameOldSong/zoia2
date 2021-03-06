import {
    ObjectId
} from 'mongodb';

export default () => ({
    schema: {
        body: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    minLength: 24,
                    maxLength: 24,
                    pattern: '^[0-9a-fA-F]+$'
                },
                code: {
                    type: 'string',
                    minLength: 36,
                    maxLength: 36
                }
            },
            required: ['id', 'code']
        }
    },
    attachValidation: true,
    async handler(req, rep) {
        // Start of Validation
        if (req.validationError) {
            rep.logError(req, req.validationError.message);
            return rep.sendBadRequestException(rep, 'Request validation error', req.validationError);
        }
        // End of Validation
        // Processing
        try {
            const userDB = await this.mongo.db.collection('users').findOne({
                _id: new ObjectId(req.body.id)
            });
            if (!userDB || !userDB.resetCode || !userDB.passwordReset || userDB.resetCode !== req.body.code) {
                return rep.sendBadRequestError(rep, 'User not found or invalid reset code');
            }
            // Update database
            const update = await this.mongo.db.collection('users').updateOne({
                _id: new ObjectId(req.body.id)
            }, {
                $set: {
                    resetCode: null,
                    passwordReset: null,
                    sessionId: null,
                    password: userDB.passwordReset
                }
            }, {
                upsert: false
            });
            // Check result
            if (!update || !update.result || !update.result.ok) {
                return rep.sendBadRequestError(rep, 'Could not update a database record');
            }
            // Send response
            return rep.sendSuccessJSON(rep);
        } catch (e) {
            rep.logError(req, null, e);
            return rep.sendInternalServerError(rep, e.message);
        }
    }
});
