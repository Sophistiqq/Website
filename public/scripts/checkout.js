// Client-side JavaScript
let confirmButton = document.querySelector('#checkout-confirm');

checkoutButton.addEventListener('click', function () {
    let cartItems = Array.from(cart.children);
    let checkoutCartItems = document.querySelector('#checkout-cart-items tbody');
    checkoutCartItems.innerHTML = '';
    cartItems.forEach(item => {
        let itemName = item.querySelector('.item-name').innerText;
        let itemPrice = item.querySelector('.item-price').innerText;
        let quantity = item.querySelector('.quantity').value;
        let row = document.createElement('tr');
        row.innerHTML = `<td>${itemName}</td><td>${itemPrice}</td><td>${quantity}</td>`;
        checkoutCartItems.appendChild(row);
    });
});

confirmButton.addEventListener('click', function (event) {
    event.preventDefault();
    let deliveryDate = document.querySelector('#delivery-date').value;
    let deliveryTime = document.querySelector('#delivery-time').value;
    let productOrders = Array.from(document.querySelector('#checkout-cart-items tbody').children).map(row => {
        let cells = row.children;
        return {
            productName: cells[0].innerText,
            price: parseFloat(cells[1].innerText.replace(/[^0-9.-]+/g, "")),
            quantity: parseInt(cells[2].innerText)
        };
    });

    
    let order = {
        userId: userId,
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime,
        productOrders: productOrders
    };
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    }).then(response => {
        if (response.ok) {
            alert('Order placed successfully!');
            location.reload();
        } else {
            alert('Failed to place order.');
        }
    });
});