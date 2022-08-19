// Title is misleading - this also handles editing events bc they use the same modal

const createTooltip = sel('#tooltip');
const createModalContainer = sel('#create-container')
const createCancel = sel('#create-cancel')
const editOpeners = document.querySelectorAll('.event-edit')

// Handling opening/closing the modal

let isEdit
let id

createTooltip.addEventListener('click', function() {
    isEdit = false
    showOverlay();
    createModalContainer.classList.remove('hidden');
})

createCancel.addEventListener('click', function() {
    hideOverlay();
    createModalContainer.classList.add('hidden')

    clearCreateInput();
})

editOpeners.forEach(function(e) {
    e.addEventListener('click', function() {
        showOverlay();
        isEdit = true
        id = e.dataset.id
        populateCreateModal(e.dataset)
        createModalContainer.classList.remove('hidden');
    })
})

function populateCreateModal(data) {
    const { name, description, color } = data;
    const isDateRange = data.isdaterange === 'true'
    const dates = data.dates.split(',').map(function(d) { return new Date(d) })

    nameInp.value = name
    descInp.value = description
    colorInp.value = `#${color}`

    if (isDateRange) {
        isDateRangeChecker.click()
        startDateInp.value = dates[0].toLocalISOString().substr(0, 10);
        endDateInp.value = dates[1].toLocalISOString().substr(0, 10);
    } else {
        dateInp.value = dates[0].toLocalISOString().substr(0, 10);
    }
}

// Handling the date range checkbox selection
const isDateRangeChecker = sel('#create-isDateRange')
const isDateRangeOptions = sel('#create-isDateRange-options')
const singleDateOptions = sel('#create-singleDate-options')
isDateRangeChecker.addEventListener('click', function() {
    if (isDateRangeChecker.checked) {
        singleDateOptions.classList.add('hidden')
        isDateRangeOptions.classList.remove('hidden')
    } else {
        isDateRangeOptions.classList.add('hidden');
        singleDateOptions.classList.remove('hidden');
    }
})

// references to the input elements
const submit = sel('#create-submit')
const nameInp = sel('#create-name')
const descInp = sel('#create-description')
const startDateInp = sel('#create-startDate')
const endDateInp = sel('#create-endDate')
const dateInp = sel('#create-date')
const colorInp = sel('#create-color')

// on submit
submit.addEventListener('click', function() {
    disableControls();

    const data = getEnteredData();

    if (isEdit) {
        data.id = id;
        makeRequest('POST', '/admin/edit', data, function(res) {
            enableControls();
            try {
                const response = JSON.parse(res.responseText);
                if (response.success) {
                    succBar(response.message);
                    setTimeout(function() {
                        window.location.reload(true);
                    }, 750);
                } else {
                    errBar(response.message);
                }
            } catch (e) {
                errBar('There was an error');
                setTimeout(function() {
                    window.location.reload(true);
                }, 750);
            }
        });
    } else {
        makeRequest('POST', '/admin/create', data, function(res) {
            enableControls();
            try {
                const response = JSON.parse(res.responseText);
                if (response.success) {
                    succBar(response.message);
                    setTimeout(function() {
                        window.location.reload(true);
                    }, 750);
                } else {
                    errBar(response.message);
                }
            } catch (e) {
                console.log(res)
                errBar('There was an error');
                // setTimeout(function() {
                //     window.location.reload(true);
                // }, 750);
            }
        });
    }
});

function disableControls() {
    createCancel.style.pointerEvents = 'none';
    submit.disabled = true;
    submit.style.pointerEvents = 'none';
}

function enableControls() {
    createCancel.style.pointerEvents = '';
    submit.disabled = false;
    submit.style.pointerEvents = '';
}

function clearCreateInput() {
    nameInp.value = ""
    descInp.value = ""
    startDateInp.value = ""
    endDateInp.value = ""
    dateInp.value = ""
    colorInp.value = '#71B778'
    if (isDateRangeChecker.checked) isDateRangeChecker.click()
}

// helper to get all the entered data into the proper format
function getEnteredData() {
    const isDateRange = isDateRangeChecker.checked;
    const start = new Date(startDateInp.value);
    const end = new Date(endDateInp.value);
    const date = new Date(dateInp.value);

    if (date) {
        date.setDate(date.getDate() + 1)
    }
    if (start) {
        start.setDate(start.getDate() + 1); // day offset
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(1);
    }
    if (end) {
        end.setDate(end.getDate() + 1); // day offset
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
    }

    const dates = isDateRange ? [start, end] : [date];

    return {
        name: nameInp.value,
        description: descInp.value,
        dates,
        isDateRange,
        color: colorInp.value,
    };
}