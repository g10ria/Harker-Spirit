const logoutButton = document.querySelector('#logout');

if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        logoutButton.disabled = true;

        makeRequest('DELETE', '/logout', {}, function(res) {
            logoutButton.disabled = false;
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
            }
        });
    });
}