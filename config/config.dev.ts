import { Config } from './index';

const config: Config = {
    server: {
        port: 5000,
    },
    db: {
        database: 'spirit',
        username: '',
        password: '',
        host: 'localhost',
        port: 27017,
    },
    auth: {
        cookieKeys: ['1', '2', '3', '4', 'I declare a thumb war'],
        useLDAP: false,
        url: 'hi!',
    },
    spiritOfficers: ['admin'],
};

export default config;
