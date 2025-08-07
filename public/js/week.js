// Week View JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the week view calendar
    initWeekView();
    
    // Subscribe to the AppState for items
    AppState.subscribe('items', updateCalendarWithItems);
    
    // Initial load of items through AppState
    AppState.actions.loadItems();
});

// Initialize the week view with dates
function initWeekView() {
    // Get current date
    const today = moment();
    
    // Find the Monday of the current week (moment uses 0 for Sunday, 1 for Monday)
    const thisWeekMonday = moment().day(1); // Get this week's Monday
    if (today.day() === 0) { // If today is Sunday, get last week's Monday
        thisWeekMonday.subtract(7, 'days');
    }
    
    // Calculate next week's Monday
    const nextWeekMonday = moment(thisWeekMonday).add(7, 'days');
    
    // Populate current week dates
    const currentWeekDates = document.getElementById('current-week-dates');
    populateWeekDates(currentWeekDates, thisWeekMonday);
    
    // Populate next week dates
    const nextWeekDates = document.getElementById('next-week-dates');
    populateWeekDates(nextWeekDates, nextWeekMonday);
    
    // Highlight today's date if it's in the view
    highlightToday();
}

// Populate a row with 5 weekdays starting from the given Monday
function populateWeekDates(rowElement, monday) {
    rowElement.innerHTML = '';
    
    for (let i = 0; i < 5; i++) { // Monday to Friday (5 days)
        const day = moment(monday).add(i, 'days');
        const cell = document.createElement('td');
        cell.textContent = day.format('DD-MM-YYYY');
        cell.setAttribute('data-date', day.format('DD-MM-YYYY'));
        rowElement.appendChild(cell);
    }
}

// Highlight today's date in the calendar
function highlightToday() {
    const today = moment().format('DD-MM-YYYY');
    const dateCells = document.querySelectorAll('td[data-date]');
    
    dateCells.forEach(cell => {
        if (cell.getAttribute('data-date') === today) {
            cell.classList.add('bg-info', 'text-white');
        }
    });
}

// Update calendar with items from the AppState
function updateCalendarWithItems(items) {
    // Clear existing items
    document.getElementById('current-week-items').innerHTML = '<td></td>'.repeat(5);
    document.getElementById('next-week-items').innerHTML = '<td></td>'.repeat(5);
    
    if (items && items.length > 0) {
        // Group items by date
        const itemsByDate = {};
        
        items.forEach(item => {
            if (!itemsByDate[item.date]) {
                itemsByDate[item.date] = [];
            }
            itemsByDate[item.date].push(item);
        });
        
        // Add items to the calendar
        addItemsToCalendar('current-week-dates', 'current-week-items', itemsByDate);
        addItemsToCalendar('next-week-dates', 'next-week-items', itemsByDate);
    }
}

// Add items to the calendar based on their dates
function addItemsToCalendar(dateRowId, itemRowId, itemsByDate) {
    const dateRow = document.getElementById(dateRowId);
    const itemRow = document.getElementById(itemRowId);
    
    // Get all date cells in the row
    const dateCells = dateRow.querySelectorAll('td');
    
    // For each date cell, find matching items
    for (let i = 0; i < dateCells.length; i++) {
        const dateCell = dateCells[i];
        const date = dateCell.getAttribute('data-date');
        const itemsForDate = itemsByDate[date] || [];
        
        // Create item cell
        if (itemRow.children[i]) {
            // Add items to the cell
            itemsForDate.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('calendar-item');
                itemElement.innerHTML = `
                    <strong>${item.name}</strong>
                    <span class="badge bg-secondary">${item.id}</span>
                `;
                itemRow.children[i].appendChild(itemElement);
            });
        }
    }
}
