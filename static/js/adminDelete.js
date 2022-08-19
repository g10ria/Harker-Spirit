const eventDeleters = document.querySelectorAll('.event-delete');

eventDeleters.forEach(function(e) {
    e.addEventListener('click', function() {
        e.style.pointerEvents = 'none'

        let id = e.dataset.id

        makeRequest('POST', '/admin/delete', { id }, function(res) {
            e.style.pointerEvents = '';
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
    })
})