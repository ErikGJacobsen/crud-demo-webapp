// Shared date utility functions for CRUD Demo WebApp

// Get the 10 weekday dates (5 from current week + 5 from next week)
function getTwoWeekDates() {
    // Get current date
    const today = moment();
    
    // Find the Monday of the current week (moment uses 0 for Sunday, 1 for Monday)
    const thisWeekMonday = moment().day(1); // Get this week's Monday
    if (today.day() === 0) { // If today is Sunday, get last week's Monday
        thisWeekMonday.subtract(7, 'days');
    }
    
    // Calculate next week's Monday
    const nextWeekMonday = moment(thisWeekMonday).add(7, 'days');
    
    // Generate dates for the current and next week
    const dates = [];
    
    // Add current week dates (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        dates.push(moment(thisWeekMonday).add(i, 'days').format('DD-MM-YYYY'));
    }
    
    // Add next week dates (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        dates.push(moment(nextWeekMonday).add(i, 'days').format('DD-MM-YYYY'));
    }
    
    return dates;
}

// Populate a dropdown with the 10 weekday dates
function populateDateDropdown(selectElement, selectedDate = null) {
    const dates = getTwoWeekDates();
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a date...';
    defaultOption.disabled = true;
    defaultOption.selected = !selectedDate;
    selectElement.appendChild(defaultOption);
    
    // Add date options
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        
        // Mark as selected if it matches the selectedDate
        if (date === selectedDate) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    // Highlight today's date with a different style
    const today = moment().format('DD-MM-YYYY');
    const todayOption = Array.from(selectElement.options).find(option => option.value === today);
    if (todayOption) {
        todayOption.classList.add('today-option');
        if (!selectedDate) {
            todayOption.selected = true;
        }
    }
}
