// CRUD Demo WebApp - Main JavaScript

// Display version number from AppState
function displayVersion(version) {
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) {
        versionDisplay.textContent = `v${version || '?.?.?'}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Subscribe to state changes
    AppState.subscribe('version', displayVersion);
    AppState.subscribe('items', displayItems);
    AppState.subscribe('ui', handleUIStateChange);
    
    // Initialize state
    AppState.actions.loadVersion();
    
    // Initialize date dropdowns if they exist
    const dateDropdown = document.getElementById('date');
    const editDateDropdown = document.getElementById('edit-date');
    
    if (dateDropdown) {
        populateDateDropdown(dateDropdown);
    }
    
    if (editDateDropdown) {
        populateDateDropdown(editDateDropdown);
    }

    // Load items when the page loads
    if (document.getElementById('items-list')) {
        AppState.actions.loadItems();
    }

    // Form submission for adding new items
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const date = document.getElementById('date').value;
            
            AppState.actions.createItem({ name, date })
                .then(() => {
                    // Reset the form
                    document.getElementById('name').value = '';
                    document.getElementById('date').value = '';
                });
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
            
            AppState.actions.updateItem(id, { name, date });
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

// UI Functions to handle state changes

// UI Functions
function displayItems(items) {
    const itemsList = document.getElementById('items-list');
    if (!itemsList) return; // Exit if not on items page
    
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
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteItem(${item.id})">Delete</button>
            </td>
        `;
        itemsList.appendChild(row);
    });
}

function handleUIStateChange(ui) {
    // Handle loading state
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = ui.isLoading ? 'block' : 'none';
    }
    
    // Handle edit state
    if (ui.editingItemId !== null) {
        showEditFormUI(ui.editingItemId);
    } else {
        hideEditForm();
    }
    
    // Process messages
    if (ui.messages && ui.messages.length > 0) {
        // Only process the most recent message if it hasn't been displayed
        const latestMessage = ui.messages[0];
        const messageElements = document.querySelectorAll('.toast');
        
        // Check if this message is already displayed
        let isDisplayed = false;
        messageElements.forEach(el => {
            if (el.dataset.messageId === String(latestMessage.id)) {
                isDisplayed = true;
            }
        });
        
        if (!isDisplayed) {
            showMessage(latestMessage.text, latestMessage.type, latestMessage.id);
        }
    }
}

async function showEditForm(id) {
    // Set editing state in AppState
    AppState.setEditingItemId(id);
}

async function showEditFormUI(id) {
    // This is called from the UI state handler
    const item = await AppState.actions.getItem(id);
    if (!item) return;
    
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    
    const editDateDropdown = document.getElementById('edit-date');
    // Repopulate date dropdown with the selected date
    populateDateDropdown(editDateDropdown, item.date);
    
    document.getElementById('edit-container').style.display = 'block';
}

function hideEditForm() {
    document.getElementById('edit-container').style.display = 'none';
    document.getElementById('edit-form').reset();
    
    // Clear editing state in AppState
    AppState.setEditingItemId(null);
}

function confirmDeleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        AppState.actions.deleteItem(id);
    }
}

function showMessage(message, type, messageId) {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const id = messageId || `toast-${Date.now()}`;
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.dataset.messageId = id;
    
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
        // Also remove it from state if it was from state
        if (messageId) {
            AppState.removeMessage(messageId);
        }
    });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
