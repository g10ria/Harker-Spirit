// Handles switching tabs in the list options

const upcomingSelector = document.querySelector('#upcoming-selector');
const allSelector = document.querySelector('#all-selector');

const upcomingList = document.querySelector('#upcoming-list');
const allList = document.querySelector('#all-list');

upcomingSelector.addEventListener('click', function() {
    allSelector.classList.remove('selected');
    upcomingSelector.classList.add('selected');

    upcomingList.classList.remove('hidden');
    allList.classList.add('hidden');
})

allSelector.addEventListener('click', function() {
    upcomingSelector.classList.remove('selected');
    allSelector.classList.add('selected');

    allList.classList.remove('hidden');
    upcomingList.classList.add('hidden');
});