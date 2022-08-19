import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as json from 'koa-json';
import * as logger from 'koa-logger';
import * as views from 'koa-views';
import * as bodyParser from 'koa-bodyparser';
import * as serve from 'koa-static';
import * as session from 'koa-session';
import * as Handlebars from 'handlebars';
import { getSpiritPageData, getDetailedEventData } from './helpers/transformer';
import requireAuth from './middleware/requireAuth';

import auth from './helpers/auth';

import adminRouter from './controllers/admin';
import escaperoomRouter from './controllers/escaperoom';

import { registerComponentsWithinDirectory } from './helpers/componentRegistration';

import config from './config';
import { getCurrentSpiritYear } from './helpers/utils';

const app = new Koa();
const router = new Router<Koa.DefaultState, Koa.Context>();

const sessionConfig: Partial<session.opts> = {
    key: config.auth.cookieKeys[0],
    maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
};

app.keys = config.auth.cookieKeys.slice(1);
app.use(session(sessionConfig, app));
app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(
    views(__dirname + '/../views', {
        map: {
            hbs: 'handlebars',
        },
        extension: 'hbs',
    }),
);

Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

registerComponentsWithinDirectory('./views/partials');

router.delete('/logout', async (ctx) => {
    if (!ctx.session) {
        return ctx.throw(
            500,
            JSON.stringify({
                message: 'There was an error logging out',
            }),
        );
    } else {
        ctx.session = null;
    }

    ctx.body = {
        success: true,
        message: 'Logging out...',
    };
});

router.post('/login', bodyParser(), async (ctx) => {
    if (ctx.session && ctx.session.authed) return;

    if (!ctx.request.body.username || !ctx.request.body.password) {
        return ctx.throw(
            401,
            JSON.stringify({
                message: 'Please provide both a username and password',
            }),
        );
    }

    let res;

    try {
        res = await auth(ctx.request.body.username, ctx.request.body.password);
    } catch (e) {
        return ctx.throw(
            401,
            JSON.stringify({
                message: e.message,
            }),
        );
    }

    if (!ctx.session)
        return ctx.throw(
            500,
            JSON.stringify({
                message: 'There was an error logging in',
            }),
        );

    ctx.session.authed = true;
    ctx.session.isAdmin = res.isAdmin;

    ctx.body = {
        success: true,
        message: res.message,
    };
});

router.get('/event/:id', requireAuth, async (ctx, next) => {
    const detailedEvent = await getDetailedEventData(ctx.params.id);
    if (detailedEvent) {
        ctx.body = {
            success: true,
            detailedEvent,
        };
    } else {
        return ctx.throw(
            401,
            JSON.stringify({
                message: `That event doesn't exist`,
            }),
        );
    }
});

router.get('/archive/:year', requireAuth, async (ctx, next) => {
    const requestedYear = ctx.params.year;
    const currentYear = getCurrentSpiritYear();
    if (requestedYear == currentYear) await ctx.redirect('/');
    else if (requestedYear > currentYear) await ctx.redirect('/');
    else await ctx.render('pages/spirit', await getSpiritPageData(ctx.params.year, ctx.session.isAdmin));
});

router.get('/', requireAuth, async (ctx, next) => {
    try {
        const spiritPageData = await getSpiritPageData(getCurrentSpiritYear(), ctx.session.isAdmin);

        await ctx.render('pages/spirit', spiritPageData);
    } catch (e) {
        console.log(e);
    }
});

app.use(router.routes());
app.use(adminRouter.routes());
app.use(escaperoomRouter.routes());

app.use(serve('./static', {}));

app.listen(config.server.port, () => {
    console.log('Server running on port ' + config.server.port);
});
