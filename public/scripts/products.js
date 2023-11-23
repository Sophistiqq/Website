const closeBtn = document.querySelector('#closeBtn')
const popup = document.querySelector('.popup')
const signInBtns = document.querySelectorAll('#signInBtn');

signInBtns.forEach(signInBtn => {
    signInBtn.addEventListener('click', () => {
        popup.classList.add('active');
    });
});
closeBtn.addEventListener('click', () => {
    popup.classList.remove('active')
})


const signin = document.querySelector('.signin')
const register = document.querySelector('.register')
const signinOrRegister = document.querySelector('#signinOrRegister')

signinOrRegister.addEventListener('click', () => {
    register.classList.toggle('hide');
    signin.classList.toggle('hide');
    signinOrRegister.innerHTML = signinOrRegister.innerHTML === 'Sign In' ? 'Register' : 'Sign In';
});



const categories = document.querySelectorAll('.categories a');

categories.forEach(category => {
    category.addEventListener('click', () => {
        // Remove active class from all categories
        categories.forEach(category => {
            category.classList.remove('active');
        });

        // Add active class to the clicked category
        category.classList.add('active');
    });
});


window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.next-product').forEach(function(button) {
        button.addEventListener('click', function() {
            const currentProduct = button.closest('.product');
            const nextProduct = currentProduct.nextElementSibling;
            
            if (nextProduct) {
                nextProduct.scrollIntoView({behavior: "smooth"});
            }
        });
    });

    document.querySelectorAll('.previous-product').forEach(function(button) {
        button.addEventListener('click', function() {
            const currentProduct = button.closest('.product');
            const previousProduct = currentProduct.previousElementSibling;
            
            if (previousProduct) {
                previousProduct.scrollIntoView({behavior: "smooth"});
            }
        });
    });
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.querySelector('.cart-modal').style.display = 'none';
});

document.querySelector('.cartBtn').addEventListener('click', function() {
    document.querySelector('.cart-modal').style.display = 'flex';
});