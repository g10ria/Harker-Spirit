import * as ldap from 'ldapjs';
import Config from '../config';
import { isAdmin } from './utils';

type AuthResults = {
    success: boolean;
    message: string;
    isAdmin?: boolean; // only if success == true
};

export default async function auth(username: string, password: string): Promise<AuthResults> {
    return Config.auth.useLDAP ? ldapAuth(username, password) : debugAuth(username);
}

function ldapAuth(username: string, password: string): Promise<AuthResults> {
    return new Promise<AuthResults>((resolve, reject) => {
        const client = ldap.createClient({
            url: Config.auth.url,
        });

        client.bind(`${username.toLowerCase()}@harker.org`, password, function (err) {
            if (err) reject(new Error('Invalid username or password'));

            resolve({
                success: true,
                message: 'Login was successful',
                isAdmin: isAdmin(username),
            });
        });
    });
}

function debugAuth(username: string): AuthResults {
    if (username === 'reject') throw new Error('Invalid username or password');
    return {
        success: true,
        message: 'Login was successful',
        isAdmin: isAdmin(username),
    };
}
