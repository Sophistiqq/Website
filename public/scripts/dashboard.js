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


