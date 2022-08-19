import * as Koa from 'koa';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    if (!ctx.session || !ctx.session.authed) await ctx.render('pages/login');
    else {
        // todo: wot
        await next();
    }
};
