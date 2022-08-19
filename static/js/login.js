const usernameInp = document.querySelector('#username');
const passwordInp = document.querySelector('#password');
const submitButton = document.querySelector('#submit');

submitButton.addEventListener('click', function() {
    submitButton.disabled = true;

    const inp = {
        username: usernameInp.value,
        password: passwordInp.value
    }
    makeRequest('POST', '/login', inp, function(res) {
        submitButton.disabled = false;
        try {
            const response = JSON.parse(res.responseText);

            if (response.success) {
                succBar(response.message);
                setTimeout(function() {
                    window.location.reload(true);
                }, 750)
            } else {
                errBar(response.message);
            }
        } catch (e) {
            errBar('There was an error');
        }
    })
})