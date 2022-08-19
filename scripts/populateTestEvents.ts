import Event from '../models/event';
import TEST_USERS from './test_events';

async function populate() {
    await Event.insertMany(TEST_USERS, (err, docs) => {
        if (err) {
            console.log(err);
            process.exit(-1);
        } else {
            console.log(`Populated ${TEST_USERS.length} test event(s)`);
            process.exit(0);
        }
    });
}

populate();
