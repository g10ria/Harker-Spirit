import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as validator from 'koa-joi-validate';
import * as Joi from 'joi';

const router = new Router<Koa.DefaultState, Koa.Context>();
router.prefix('/escaperoom');

const levels = [
    {
        passwordToNext: ['spirit'],
        rawHTML: `
        <div>
            Welcome to the Escape Room! The fastest team to escape wins 200 spirit points for their grade. Please allocate one person in your team to screen share this site on their computer screen! Having a pencil and paper handy will be useful for some of the activities. Let's get started!
            <br>
            <br>
            <a href="https://docs.google.com/forms/d/1Duw5yPjvxXsr-cy-j886DJtEXCOnk1-IzreyysG_Y8M/edit" target="_blank">First clue</a>
        </div>
        `,
        keyHTML: `<div id="submission">
            <label for="password">Key</label>
            <input type="text" id="password" name="password"><br><br>
            <div class="spacer"></div>
            <button type="submit" id="submit">Submit</button>
            <div class="spacer"></div>
        </div>`,
        URL: '/escaperoom/1',
    },
    {
        passwordToNext: ['3.4 miles', '3.4'],
        rawHTML: `<div>
            For the next activity, you will start by assembling a puzzle. This puzzle is not collaborative, so only one person can edit it. Regardless, everyone should be helping as they screenshare. Tip: Make use of the "arrange" feature in the top left hand corner. Go to <a href="https://tiny.cc/thesecondclue" target="_blank">tiny.cc/thesecondclue</a> to complete the activity.
        </div>`,
        keyHTML: `<div id="submission">
            <label for="password">Key</label>
            <input type="text" id="password" name="password"><br><br>
            <div class="spacer"></div>
            <button type="submit" id="submit">Submit</button>
            <div class="spacer"></div>
        </div>`,
        URL: '/escaperoom/w24ifm6quk91fmto1mq7',
    },
    {
        passwordToNext: ['2009-02-10'],
        rawHTML: `
        <div>
        For this activity, you will need to encode the message below. Every three characters correspond to a letter in the table. Letters are separated by color. The apostrophe signifies an apostrophe.
        <br>
        <br>
        <img src="/img/encoded_clue.png" style="width: 50%">
        </div>
        `,
        keyHTML: `<div id="submission">
            <label for="password">Key</label>
            <input type="date" id="password" name="password"><br><br>
            <div class="spacer"></div>
            <button type="submit" id="submit">Submit</button>
            <div class="spacer"></div>
        </div>`,
        URL: '/escaperoom/ihynzaivtonbmoipgzet',
    },
    {
        passwordToNext: ['1966', '1968'],
        rawHTML: `
        <div>
        Fill in the blanks using the hints:

        _ _ _ _ _ _ (1)  _ _ _ _ _ _ _ _ _ (2)
        <br>
        <br>
        To find the first word, go to <a href="https://spirit.harker.org" target="_blank">spirit.harker.org</a> & find the event color for “The Cost is Correct”
        <br>
        To find the second word, click on “Spirit Kickoff” to reveal a button labelled “Hint 2” on the right hand side of your screen. Click it to discover the second word!
        <br>
        <br>
        Your key: The year _ _ _ _ _ _ (1)  _ _ _ _ _ _ _ _ _ (2)  was released (in #### format).
        </div>
        `,
        keyHTML: `<div id="submission">
            <label for="password">Key</label>
            <input type="text" id="password" name="password"><br><br>
            <div class="spacer"></div>
            <button type="submit" id="submit">Submit</button>
            <div class="spacer"></div>
        </div>`,
        URL: '/escaperoom/ddhfwoeio45xmuhfdb8y',
    },
    {
        URL: 'https://docs.google.com/forms/d/1ChsRnaDzOdXWzY-h7HI3af_KyVN01AdfJqksLKNnFwc/edit',
    },
];

router.get('/:url', async (ctx, next) => {
    const index = levels.findIndex((l) => {
        return l.URL.substr(l.URL.lastIndexOf('/') + 1) == ctx.params.url;
    });
    if (index != -1) {
        await ctx.render('pages/escaperoom', {
            number: index + 1,
            index,
            rawHTML: levels[index].rawHTML,
            keyHTML: levels[index].keyHTML,
        });
    }
});

router.post(
    '/',
    validator({
        body: {
            from: Joi.number()
                .min(0)
                .max(levels.length - 2), // constant
            password: Joi.string().max(100).allow(''),
        },
    }),
    async (ctx, next) => {
        const { from, password } = ctx.request.body;
        if (levels[from].passwordToNext.includes(password)) {
            // correct password
            ctx.body = {
                success: true,
                message: 'Correct',
                next: levels[from + 1].URL,
            };
        } else {
            ctx.body = {
                success: false,
                message: 'Incorrect',
            };
        }
    },
);

export default router;
