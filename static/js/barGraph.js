// Bar chunk listeners
document.querySelectorAll('.bar-chunk').forEach((b, i) => {
    b.addEventListener('click', function() {
        selectEvent(b.dataset.id);
    });
});