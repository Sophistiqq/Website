function closeModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.remove('show');
}

function openModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.add('show');
}

var addButton = document.getElementById('add-user');
addButton.addEventListener('click', openModal);

var closeButton = document.querySelector('.close-button');
closeButton.addEventListener('click', closeModal);

function populateModal(event) {
    var row = event.target.closest('.user-row');
    var inputs = document.querySelectorAll('.edit-user-modal input, .edit-user-modal select');
    inputs[0].value = row.querySelector('.user-id').textContent;
    inputs[1].value = row.querySelector('.user-fullname').textContent;
    inputs[2].value = row.querySelector('.user-username').textContent;
    inputs[3].value = row.querySelector('.user-email').textContent;
    inputs[4].value = row.querySelector('.user-password').textContent;
    inputs[5].value = row.querySelector('.user-contact-number').textContent;
    inputs[6].value = row.querySelector('.user-address').textContent;
    inputs[7].value = row.querySelector('.user-role').textContent;
}

var tableRows = document.querySelectorAll('.user-row');
tableRows.forEach(function(row) {
    row.addEventListener('click', populateModal);
});

function closeModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.remove('show');
}

function highlightTableRow(event) {
    var tableRows = document.querySelectorAll('.user-row');
    tableRows.forEach(function(row) {
        row.classList.remove('highlight');
    });
    event.target.closest('.user-row').classList.add('highlight');
}

function highlightTableRows() {
    var tableRows = document.querySelectorAll('.user-row');
    tableRows.forEach(function(row) {
        row.addEventListener('click', highlightTableRow);
    });
}

highlightTableRows();

// Add event listener to the close button for the edit modal
var closeEditButton = document.getElementById('close-button-edit');
closeEditButton.addEventListener('click', closeEditModal);

function closeEditModal() {
    var editModal = document.querySelector('.edit-user-modal');
    editModal.classList.remove('show');
}

// Add event listener to the "Edit User" button to open the edit modal
var editButton = document.getElementById('edit-user');
editButton.addEventListener('click', openEditModal);

function openEditModal() {
    var editModal = document.querySelector('.edit-user-modal');
    var highlightedRow = document.querySelector('.user-row.highlight');
    if (highlightedRow) {
        editModal.classList.add('show');
    }
}




// Delete the selected user, it will send a request to the server to delete the user, express will handle the request and delete the user from the database
// button: <button id="delete-user">Delete User</button>
var deleteUserButton = document.querySelector('#delete-user');
deleteUserButton.addEventListener('click', deleteUser);

function deleteUser() {
    var highlightedRow = document.querySelector('.user-row.highlight');
    var userId = highlightedRow.querySelector('.user-id').textContent;
    var username = highlightedRow.querySelector('.user-username').textContent;

    var confirmation = prompt('Please enter the username "' + username + '" to confirm deletion:');
    if (confirmation === username) {
        fetch('./admin-delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            location.reload(); // Refresh the page
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Username does not match. Deletion canceled.');
    }
}






setInterval(() => {
    fetch('./uptime')
        .then(response => response.text())
        .then(uptime => {
            document.getElementById('systemUptime').textContent = uptime;
        });
}, 1000);




// Function to highlight a product row
function highlightProductRow(event) {
    // Remove highlight from previously highlighted row
    var highlightedRow = document.querySelector('.product-row.highlight');
    if (highlightedRow) {
        highlightedRow.classList.remove('highlight');
    }

    // Add highlight to the clicked row
    var clickedRow = event.target.closest('.product-row');
    clickedRow.classList.add('highlight');
}

// Add event listener to each product row
var productRows = document.querySelectorAll('.product-row');
productRows.forEach(function(row) {
    row.addEventListener('click', highlightProductRow);
});




// Select the delete button
var deleteProductButton = document.querySelector('#delete-product');

// Add event listener to the delete button
deleteProductButton.addEventListener('click', deleteProduct);

function deleteProduct() {
    // Find the highlighted product row
    var highlightedRow = document.querySelector('.product-row.highlight');

    // If no row is highlighted, do nothing
    if (!highlightedRow) return;

    // Extract the product ID from the highlighted row
    var productId = highlightedRow.querySelector('td[data-th="ID"]').textContent;

    // Confirm the deletion with the user
    var confirmation = confirm('Are you sure you want to delete this product?');

    // If the user confirmed, send a DELETE request to the server
    if (confirmation) {
        fetch('./admin-delete-product', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: productId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            location.reload(); // Refresh the page
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}


// Select the add product button
var addProductButton = document.querySelector('#add-product');

// Add event listener to the add product button
addProductButton.addEventListener('click', openAddProductModal);

function openAddProductModal() {
    // Select the add product modal
    var addProductModal = document.querySelector('.add-product-modal');

    // Show the add product modal
    addProductModal.classList.add('show');
}

// Select the close button in the add product modal
var closeAddProductButton = document.querySelector('.add-product-modal .close-button');

// Add event listener to the close button in the add product modal
closeAddProductButton.addEventListener('click', closeAddProductModal);

function closeAddProductModal() {
    // Select the add product modal
    var addProductModal = document.querySelector('.add-product-modal');

    // Hide the add product modal
    addProductModal.classList.remove('show');
}

// Select the edit product button
var editProductButton = document.querySelector('#edit-product');


// Add event listener to the edit product button
editProductButton.addEventListener('click', openEditProductModal);

function openEditProductModal() {
    // Select the edit product modal
    var editProductModal = document.querySelector('.edit-product-modal');

    // Find the highlighted product row
    var highlightedRow = document.querySelector('.product-row.highlight');

    // If no row is highlighted, do nothing
    if (!highlightedRow) return;

    // Populate the edit product modal with the product data
    var inputs = document.querySelectorAll('.edit-product-modal input, .edit-product-modal select');
    inputs[0].value = highlightedRow.querySelector('td[data-th="ID"]').textContent;
    inputs[1].value = highlightedRow.querySelector('td[data-th="Name"]').textContent;
    inputs[2].value = highlightedRow.querySelector('td[data-th="Price"]').textContent;
    inputs[3].value = highlightedRow.querySelector('td[data-th="Category"]').textContent;

    // Show the edit product modal
    editProductModal.classList.add('show');
}

// Select the close button in the edit product modal
var closeEditProductButton = document.querySelector('.edit-product-modal .close-button');

// Add event listener to the close button in the edit product modal
closeEditProductButton.addEventListener('click', closeEditProductModal);

function closeEditProductModal() {
    // Select the edit product modal
    var editProductModal = document.querySelector('.edit-product-modal');

    // Hide the edit product modal
    editProductModal.classList.remove('show');
}


