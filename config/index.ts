import prod from './config.production';
import dev from './config.dev';

export interface Config {
    server: {
        port: number;
    };
    db: {
        database: string;
        username: string;
        password: string;
        host: string;
        port: number;
    };
    auth: {
        cookieKeys: string[];
        useLDAP: boolean;
        url: string;
    };
    spiritOfficers: string[];
}

const config = !process.env.NODE_ENV || process.env.NODE_ENV == 'development' ? dev : prod;
export default config;
