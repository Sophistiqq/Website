const closeBtn = document.querySelector('#closeBtn')
const popup = document.querySelector('.popup')
const signInBtn = document.querySelector('#signInBtn')

signInBtn.addEventListener('click', () => {
    popup.classList.add('active')
});
closeBtn.addEventListener('click', () => {
    popup.classList.remove('active')
})





