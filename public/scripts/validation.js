window.onload = function () {
    var signinForm = document.querySelector('.signin');
    var registerForm = document.querySelector('.register');

    signinForm.addEventListener('submit', function (event) {
        validateForm(event, this);
    });

    registerForm.addEventListener('submit', function (event) {
        validateForm(event, this);
    });
}

function validateForm(event, form) {
    var username = form['username'].value;
    var password = form['password'].value;

    if (!/^[\w-]{3,16}$/.test(username)) {
        event.preventDefault();
        var errorElement = document.createElement('div');
        errorElement.classList.add('error');
        errorElement.innerText = 'Invalid username';
        form.appendChild(errorElement);
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,32}$/.test(password)) {
        event.preventDefault();
        var errorElement = document.createElement('div');
        errorElement.classList.add('error');
        errorElement.innerText = 'Invalid password';
        form.appendChild(errorElement);
    }

    if (form['email']) {
        var email = form['email'].value;
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            event.preventDefault();
            var errorElement = document.createElement('div');
            errorElement.classList.add('error');
            errorElement.innerText = 'Invalid email';
            form.appendChild(errorElement);
        }
    }

    if (form['contact_number']) {
        var contactNumber = form['contact_number'].value;
        if (!/^\d{10,15}$/.test(contactNumber)) {
            event.preventDefault();
            var errorElement = document.createElement('div');
            errorElement.classList.add('error');
            errorElement.innerText = 'Invalid contact number';
            form.appendChild(errorElement);
        }
    }

    if (form['address']) {
        var address = form['address'].value;
        if (!/^[\w ,.-]{1,100}$/.test(address)) {
            event.preventDefault();
            var errorElement = document.createElement('div');
            errorElement.classList.add('error');
            errorElement.innerText = 'Invalid address';
            form.appendChild(errorElement);
        }
    }
}


