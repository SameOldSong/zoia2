/* eslint no-console:0 */
import inquirer from 'inquirer';
import commandLineArgs from 'command-line-args';
import colors from 'colors/safe';
import fs from 'fs-extra';
import gettextParser from 'gettext-parser';
import cloneDeep from 'lodash/cloneDeep';
import {
    MongoClient
} from 'mongodb';

let db;
const optionDefinitions = [{
    name: 'install',
    alias: 'i',
    type: Boolean
}, {
    name: 'modify',
    alias: 'm',
    type: Boolean
}, {
    name: 'split',
    alias: 's',
    type: Boolean
}, {
    name: 'combine',
    alias: 'c',
    type: Boolean
}, {
    name: 'cleanup',
    alias: 'd',
    type: Boolean
}];
const options = commandLineArgs(optionDefinitions);

const splitLocales = () => {
    console.log(`${colors.green(' * ')} Spliting locales...`);
    ['user', 'admin'].map(t => {
        console.log(`${colors.green(' * ')} Processing area: ${t}`);
        const locales = fs.readdirSync(`${__dirname}/../shared/locales/combined/${t}`);
        locales.filter(l => l !== '_build').map(locale => {
            console.log(`${colors.green(' * ')} Processing locale: ${locale}`);
            const transModules = {};
            const input = fs.readFileSync(`${__dirname}/../shared/locales/combined/${t}/${locale}/messages.po`);
            const po = gettextParser.po.parse(input);
            const trans = po.translations[''];
            Object.keys(trans).map(i => {
                if (i && i.length && trans[i] && trans[i].comments) {
                    const {
                        reference
                    } = trans[i].comments;
                    if (reference) {
                        const refArr = reference.split(/\n/);
                        refArr.map(m => {
                            const ms = m.split(/\//);
                            const area = ms.length >= 2 && ms[0] === 'modules' ? ms[1] : '_core';
                            if (!transModules[area]) {
                                transModules[area] = {};
                            }
                            transModules[area][i] = trans[i];
                        });
                    }
                }
            });
            Object.keys(transModules).map(m => {
                if (m === '_core') {
                    return;
                }
                console.log(`${colors.green(' * ')} Processing module: ${m}`);
                const dir = m === '_core' ? `${__dirname}/../shared/locales/core/${locale}` : `${__dirname}/../../modules/${m}/locales/${t}/${locale}`;
                const filename = m === '_core' ? `${__dirname}/../shared/locales/core/${locale}/messages.po` : `${__dirname}/../../modules/${m}/locales/${t}/${locale}/messages.po`;
                fs.ensureDirSync(dir);
                const data = gettextParser.po.compile({
                    charset: po.charset,
                    headers: po.headers,
                    translations: {
                        '': transModules[m]
                    }
                });
                fs.writeFileSync(filename, data);
            });
        });
    });
};

const combieLocales = () => {
    const modules = Object.keys(require('../build/modules.json'));
    console.log(`${colors.green(' * ')} Combining locales...`);
    ['user', 'admin'].map(t => {
        const locales = fs.readdirSync(`${__dirname}/../shared/locales/core`);
        locales.filter(l => l !== '_build').map(locale => {
            const messagesCore = fs.readFileSync(`${__dirname}/../shared/locales/core/${locale}/messages.po`);
            const messagesCorePo = gettextParser.po.parse(messagesCore);
            const messagesCoreTrans = messagesCorePo.translations[''];
            modules.map(m => {
                if (!fs.existsSync(`${__dirname}/../../modules/${m}/locales/${t}/${locale}/messages.po`)) {
                    return;
                }
                const messagesModule = fs.readFileSync(`${__dirname}/../../modules/${m}/locales/${t}/${locale}/messages.po`);
                const messagesModulePo = gettextParser.po.parse(messagesModule);
                const messagesModuleTrans = messagesModulePo.translations[''];
                Object.keys(messagesModuleTrans).map(mmt => {
                    if (!messagesCoreTrans[mmt]) {
                        messagesCoreTrans[mmt] = messagesModuleTrans[mmt];
                    }
                });
            });
            const data = gettextParser.po.compile({
                charset: messagesCorePo.charset,
                headers: messagesCorePo.headers,
                translations: {
                    '': messagesCoreTrans
                }
            });
            fs.writeFileSync(`${__dirname}/../shared/locales/combined/${t}/${locale}/messages.po`, data);
        });
    });
};

const cleanupLocales = () => {
    const modules = Object.keys(require('../build/modules.json'));
    console.log(`${colors.green(' * ')} Cleaning up combined locales...`);
    ['user', 'admin'].map(t => {
        console.log(`${colors.green(' * ')} Processing area: ${t}`);
        const locales = fs.readdirSync(`${__dirname}/../shared/locales/combined/${t}`);
        locales.filter(l => l !== '_build').map(locale => {
            console.log(`${colors.green(' * ')} Processing locale: ${locale}`);
            const input = fs.readFileSync(`${__dirname}/../shared/locales/combined/${t}/${locale}/messages.po`);
            const po = gettextParser.po.parse(input);
            const trans = cloneDeep(po.translations['']);
            Object.keys(trans).map(item => {
                if (trans[item].comments && trans[item].comments.reference) {
                    const references = trans[item].comments.reference.split(/\n/).filter(ref => {
                        const [sign, module] = ref.split(/\//);
                        if (sign === 'modules' && module && modules.indexOf(module) === -1) {
                            return false;
                        }
                        return true;
                    });
                    if (references.length) {
                        po.translations[''][item].comments.reference = references.join(/\n/);
                    } else {
                        delete po.translations[''][item];
                    }
                }
            });
            const data = gettextParser.po.compile({
                charset: po.charset,
                headers: po.headers,
                translations: po.translations
            });
            fs.writeFileSync(`${__dirname}/../shared/locales/combined/${t}/${locale}/messages.po`, data);
        });
    });
};

const install = async () => {
    const security = require('../../etc/security.json');
    const modules = Object.keys(require('../build/modules.json'));
    const questions = [{
        type: 'rawlist',
        name: 'install',
        message: 'Which modules to process?',
        choices: ['All', 'None', ...modules],
        default: 'All'
    }];
    try {
        console.log(`This tool will run the module installation scripts.`);
        console.log(`Modules available: ${modules.join(', ')}`);
        console.log('');
        const data = await inquirer.prompt(questions);
        console.log('');
        const mongoClient = new MongoClient(security.mongo.url, {
            useNewUrlParser: true
        });
        await mongoClient.connect();
        db = mongoClient.db(security.mongo.dbName);
        if (data.install !== 'None') {
            await Promise.all((data.install === 'All' ? modules : [data.install]).map(async m => {
                console.log(`${colors.green(' * ')} Processing module: ${m}...`);
                try {
                    const moduleDatabaseConfig = require(`../../modules/${m}/database.json`);
                    const collections = Object.keys(moduleDatabaseConfig.collections);
                    if (collections.length) {
                        await Promise.all(collections.map(async c => {
                            console.log(`${colors.green(' * ')} Creating collection: ${c}...`);
                            try {
                                await db.createCollection(c);
                            } catch (e) {
                                console.log(`${colors.green(' ! ')} Collection is not created: ${c} (already exists?)`);
                            }
                            const {
                                indexesAsc,
                                indexesDesc
                            } = moduleDatabaseConfig.collections[c];
                            if (indexesAsc && indexesAsc.length) {
                                console.log(`${colors.green(' * ')} Creating ASC indexes for collection: ${c}...`);
                                const indexes = {};
                                indexesAsc.map(i => indexes[i] = 1);
                                try {
                                    await db.collection(c).createIndex(indexes, {
                                        name: `${m}_asc`
                                    });
                                } catch (e) {
                                    console.log('');
                                    console.log(colors.red(e));
                                    process.exit(1);
                                }
                            }
                            if (indexesDesc && indexesDesc.length) {
                                console.log(`${colors.green(' * ')} Creating DESC indexes for collection: ${c}...`);
                                const indexes = {};
                                indexesDesc.map(i => indexes[i] = 1);
                                try {
                                    await db.collection(c).createIndex(indexes, {
                                        name: `${m}_desc`
                                    });
                                } catch (e) {
                                    console.log('');
                                    console.log(colors.red(e));
                                    process.exit(1);
                                }
                            }
                        }));
                    }
                } catch (e) {
                    // Ignore
                }
                try {
                    console.log(`${colors.green(' * ')} Running installation script for module: ${m}...`);
                    const installScript = require(`../../modules/${m}/install.js`);
                    await installScript.default(db);
                } catch (e) {
                    // Ignore
                }
            }));
        }
        console.log(`${colors.green(' * ')} Done`);
        mongoClient.close();
    } catch (e) {
        console.log('');
        console.log(colors.red(e));
        process.exit(1);
    }
};

console.log(colors.green.inverse('\n                                      '));
console.log(colors.green.inverse(' Zoia 2 Helper Scripts                '));
console.log(colors.green.inverse('                                      \n'));

// Do we need to split locales?
if (options.split) {
    splitLocales();
    console.log(`${colors.green(' * ')} Done`);
    process.exit(0);
}

// Do we need to combine locales?
if (options.combine) {
    combieLocales();
    console.log(`${colors.green(' * ')} Done`);
    process.exit(0);
}

// Do we need to clean up locales?
if (options.cleanup) {
    cleanupLocales();
    console.log(`${colors.green(' * ')} Done`);
    process.exit(0);
}
// Do we need to install?
if (options.install) {
    install();
} else {
    console.log('Usage: node tools <--install (--modify)|--split|--combine|--cleanup>\n\n --install (-i): run Zoia installation, use --modify (-m) to modify existing config.json file\n --split (-s): split locales from shared directory to modules\n --combine locales from modules to shared directory\n --cleanup (-d): remove unused locale entries from shared directory');
}
