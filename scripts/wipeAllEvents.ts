import Event from '../models/event';

(async function () {
    let res = await Event.remove({});
    if (res.ok) console.log(`Successfully deleted ${res.deletedCount} event(s)`);
    else console.log('There was en error');

    process.exit();
})();
