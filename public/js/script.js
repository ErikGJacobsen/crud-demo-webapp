// CRUD Demo WebApp - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load items when the page loads
    if (document.getElementById('items-list')) {
        loadItems();
    }

    // Form submission for adding new items
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const date = document.getElementById('date').value;
            
            createItem({ name, date });
        });
    }

    // Form submission for editing items
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const name = document.getElementById('edit-name').value;
            const date = document.getElementById('edit-date').value;
            
            updateItem(id, { name, date });
        });
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            hideEditForm();
        });
    }
});

// API Functions
async function loadItems() {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        
        displayItems(items);
    } catch (error) {
        showMessage('Error loading items', 'danger');
        console.error('Error loading items:', error);
    }
}

async function createItem(item) {
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create item');
        }
        
        const newItem = await response.json();
        
        // Reset the form
        document.getElementById('name').value = '';
        document.getElementById('date').value = '';
        
        // Reload items or add the new item to the list
        loadItems();
        
        showMessage('Item created successfully', 'success');
    } catch (error) {
        showMessage(error.message, 'danger');
        console.error('Error creating item:', error);
    }
}

async function getItem(id) {
    try {
        const response = await fetch(`/api/items/${id}`);
        if (!response.ok) {
            throw new Error('Item not found');
        }
        
        return await response.json();
    } catch (error) {
        showMessage(error.message, 'danger');
        console.error(`Error fetching item ${id}:`, error);
        return null;
    }
}

async function updateItem(id, item) {
    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update item');
        }
        
        const updatedItem = await response.json();
        
        // Hide the edit form
        hideEditForm();
        
        // Reload items
        loadItems();
        
        showMessage('Item updated successfully', 'success');
    } catch (error) {
        showMessage(error.message, 'danger');
        console.error(`Error updating item ${id}:`, error);
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        
        // Remove the item from the UI
        document.getElementById(`item-${id}`).remove();
        
        // Check if there are no more items
        const itemsList = document.getElementById('items-list');
        if (itemsList.children.length === 0) {
            document.getElementById('no-items').style.display = 'block';
        }
        
        showMessage('Item deleted successfully', 'success');
    } catch (error) {
        showMessage(error.message, 'danger');
        console.error(`Error deleting item ${id}:`, error);
    }
}

// UI Functions
function displayItems(items) {
    const itemsList = document.getElementById('items-list');
    const noItemsMessage = document.getElementById('no-items');
    
    // Clear the current list
    itemsList.innerHTML = '';
    
    if (items.length === 0) {
        noItemsMessage.style.display = 'block';
        return;
    }
    
    noItemsMessage.style.display = 'none';
    
    // Add each item to the table
    items.forEach(item => {
        const row = document.createElement('tr');
        row.id = `item-${item.id}`;
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.date)}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="showEditForm(${item.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        itemsList.appendChild(row);
    });
}

async function showEditForm(id) {
    const item = await getItem(id);
    if (!item) return;
    
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-date').value = item.date;
    
    document.getElementById('edit-container').style.display = 'block';
}

function hideEditForm() {
    document.getElementById('edit-container').style.display = 'none';
    document.getElementById('edit-form').reset();
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const id = `toast-${Date.now()}`;
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${escapeHtml(message)}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    container.appendChild(toast);
    
    const toastInstance = new bootstrap.Toast(toast, { autohide: true, delay: 5000 });
    toastInstance.show();
    
    // Remove the toast from the DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
