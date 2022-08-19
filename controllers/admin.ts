import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as validator from 'koa-joi-validate';
import * as Joi from 'joi';

import Event, { EventProps } from '../models/event';

import { ObjectId } from 'mongodb';
import { getCurrentSpiritYear, getCurrentSpiritYearframe, getCurrentSpiritClasses } from '../helpers/utils';
import { AdminPage } from '../helpers/types';
import { getAllAdminEvents } from '../helpers/transformer';
import requireAdmin from '../middleware/requireAdmin';
import { validateRanking, validateCreate } from '../helpers/validators';

const router = new Router<Koa.DefaultState, Koa.Context>();
router.prefix('/admin');
router.use(requireAdmin);

// router.use(requireAuth).use(rejectNonAdmin);

router.get('/', async (ctx, next) => {
    // get point totals and whatnot
    const adminEvents = await getAllAdminEvents();
    const yearframe = getCurrentSpiritYearframe();
    const classes = getCurrentSpiritClasses();
    const adminData: AdminPage = {
        classes,
        yearframe,
        adminEvents,
    };
    await ctx.render('pages/admin', adminData);
});

router.delete(
    '/ranking',
    validator({
        body: {
            rankingId: Joi.string(),
        },
    }),
    async (ctx, next) => {
        const ranking = [];
        const points = [];

        const editedEvent = await Event.updateOne(
            { _id: ctx.request.body.rankingId },
            {
                ranking,
                points,
            },
        );

        if (!editedEvent.ok) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error clearing the rankings',
                }),
            );
        } else {
            ctx.body = {
                success: true,
                message: 'Rankings were successfully cleared',
            };
        }
    },
);

router.post(
    '/ranking',
    validator({
        body: {
            rankingId: Joi.string(),
            points: Joi.array().length(4).items(Joi.string().allow('')),
            ranking: Joi.array().length(4).items(Joi.string().allow('')),
        },
    }),
    async (ctx, next) => {
        const { rankingId, points, ranking } = ctx.request.body;

        const error = await validateRanking(rankingId, points, ranking);

        if (error) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: error,
                }),
            );
        }

        const editedEvent = await Event.updateOne(
            { _id: rankingId },
            {
                ranking: ranking.map((r) => parseInt(r)),
                points: points.map((p) => parseInt(p)),
            },
        );

        if (!editedEvent.ok) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error updating the rankings',
                }),
            );
        } else {
            ctx.body = {
                success: true,
                message: 'Rankings were successfully updated',
            };
        }
    },
);

router.post(
    '/links',
    validator({
        body: {
            linksId: Joi.string(),
            links: Joi.array().items(
                Joi.object().keys({
                    link: Joi.string(),
                    name: Joi.string().max(50),
                    class: Joi.string(),
                }),
            ),
        },
    }),
    async (ctx, next) => {
        const { links, linksId } = ctx.request.body;

        links.forEach((l) => {
            if (l.class === 'global') l.class = 0;
        });

        const editedEvent = await Event.updateOne(
            { _id: linksId },
            {
                links,
            },
        );

        if (!editedEvent.ok) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error updating the links',
                }),
            );
        } else {
            ctx.body = {
                success: true,
                message: 'Links were successfully updated',
            };
        }
    },
);

// Creates an event (requires a complete event object)
router.post(
    '/create',
    validator({
        body: {
            name: Joi.string().max(35).allow(''),
            description: Joi.string().max(300).allow(''),
            isDateRange: Joi.boolean(),
            dates: Joi.array(),
            color: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/),
        },
    }),
    async (ctx, next) => {
        const year = getCurrentSpiritYear();
        const { name, description, isDateRange, dates, color } = ctx.request.body;

        const error = validateCreate(name, isDateRange, dates);

        if (error) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: error,
                }),
            );
        }

        const eventProps: EventProps = {
            year,
            name,
            description,
            isDateRange,
            dates,
            color: color.substr(1),

            ranking: [],
            points: [],
            links: [],
        };

        const createdEvent = await Event.create(eventProps);

        if (!createdEvent) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error creating the event',
                }),
            );
        } else {
            ctx.body = {
                success: true,
                message: 'Event was successfully created',
            };
        }
    },
);

// Updates an event (requires a complete event object)
router.post(
    '/edit',
    validator({
        body: {
            id: Joi.string(),
            name: Joi.string().max(35).allow(''),
            description: Joi.string().max(300).allow(''),
            isDateRange: Joi.boolean(),
            dates: Joi.array(),
            color: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/),
        },
    }),
    async (ctx, next) => {
        const { name, isDateRange, dates } = ctx.request.body;
        ctx.request.body.color = ctx.request.body.color.substr(1);

        const error = validateCreate(name, isDateRange, dates);

        console.log('edit error: ');
        console.log(error);

        if (error) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: error,
                }),
            );
        }

        const editedEvent = await Event.updateOne(
            {
                _id: new ObjectId(ctx.request.body.id),
            },
            ctx.request.body,
        );

        if (!editedEvent.ok) {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error editing the event',
                }),
            );
        } else {
            ctx.body = {
                success: true,
                message: 'Event was successfully edited',
            };
        }
    },
);

// Deletes an event
router.post(
    '/delete',
    validator({
        id: Joi.string(), // fix
    }),
    async (ctx, next) => {
        const deletedEvent = await Event.deleteOne({
            _id: ctx.request.body.id,
        });

        if (deletedEvent.ok) {
            ctx.body = {
                success: true,
                message: 'Event was successfully deleted',
            };
        } else {
            return ctx.throw(
                400,
                JSON.stringify({
                    message: 'There was an error deleting the event',
                }),
            );
        }
    },
);

export default router;
