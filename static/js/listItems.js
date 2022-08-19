let previousItem = null;

document.querySelectorAll('.item').forEach(function(item) {
    item.addEventListener('click', function() {
        selectEvent(item.dataset.id);
        if (previousItem) {
            previousItem.classList.remove('selected');
        }
        previousItem = item;
        item.classList.add('selected');
    })
})