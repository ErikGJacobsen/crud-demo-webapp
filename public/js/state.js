// State Management for CRUD Demo WebApp

/**
 * Application state management
 */
const AppState = (function() {
    // Private state
    let state = {
        items: [],
        version: null,
        ui: {
            editingItemId: null,
            isLoading: false,
            messages: []
        }
    };
    
    // Listeners for state changes
    const listeners = {
        items: [],
        version: [],
        ui: []
    };
    
    // Get a copy of the state
    function getState() {
        return JSON.parse(JSON.stringify(state));
    }
    
    // Get items
    function getItems() {
        return [...state.items];
    }
    
    // Update items and notify listeners
    function setItems(newItems) {
        state.items = [...newItems];
        notifyListeners('items');
        return getItems();
    }
    
    // Get version
    function getVersion() {
        return state.version;
    }
    
    // Update version and notify listeners
    function setVersion(newVersion) {
        state.version = newVersion;
        notifyListeners('version');
        return state.version;
    }
    
    // Get UI state
    function getUI() {
        return {...state.ui};
    }
    
    // Update specific UI state property
    function updateUI(updates) {
        state.ui = {...state.ui, ...updates};
        notifyListeners('ui');
        return {...state.ui};
    }
    
    // Set loading state
    function setLoading(isLoading) {
        state.ui.isLoading = isLoading;
        notifyListeners('ui');
        return state.ui.isLoading;
    }
    
    // Add message to UI state
    function addMessage(message, type) {
        const id = Date.now();
        const newMessage = {
            id,
            text: message,
            type,
            timestamp: new Date().toISOString()
        };
        
        state.ui.messages = [newMessage, ...state.ui.messages].slice(0, 5); // Keep only last 5 messages
        notifyListeners('ui');
        
        // Return message ID in case we want to remove it later
        return id;
    }
    
    // Remove a message
    function removeMessage(messageId) {
        state.ui.messages = state.ui.messages.filter(msg => msg.id !== messageId);
        notifyListeners('ui');
    }
    
    // Set editing item ID
    function setEditingItemId(id) {
        state.ui.editingItemId = id;
        notifyListeners('ui');
        return id;
    }
    
    // Subscribe to state changes
    function subscribe(stateSection, callback) {
        if (!listeners[stateSection]) {
            listeners[stateSection] = [];
        }
        
        listeners[stateSection].push(callback);
        
        // Return unsubscribe function
        return function unsubscribe() {
            listeners[stateSection] = listeners[stateSection].filter(cb => cb !== callback);
        };
    }
    
    // Notify all listeners of state section
    function notifyListeners(stateSection) {
        if (listeners[stateSection]) {
            const stateToPass = stateSection === 'items' ? getItems() : 
                               stateSection === 'version' ? getVersion() : 
                               stateSection === 'ui' ? getUI() : null;
            
            listeners[stateSection].forEach(callback => {
                try {
                    callback(stateToPass);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
    }
    
    // API actions - these modify state after API calls
    const actions = {
        // Load items from API
        async loadItems() {
            setLoading(true);
            try {
                const response = await fetch('/api/items');
                const items = await response.json();
                setItems(items);
                return items;
            } catch (error) {
                addMessage('Error loading items', 'danger');
                console.error('Error loading items:', error);
                return [];
            } finally {
                setLoading(false);
            }
        },
        
        // Create new item
        async createItem(item) {
            setLoading(true);
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
                
                // Add the new item to the state
                setItems([...state.items, newItem]);
                
                addMessage('Item created successfully', 'success');
                return newItem;
            } catch (error) {
                addMessage(error.message, 'danger');
                console.error('Error creating item:', error);
                return null;
            } finally {
                setLoading(false);
            }
        },
        
        // Get item by ID
        async getItem(id) {
            setLoading(true);
            try {
                const response = await fetch(`/api/items/${id}`);
                if (!response.ok) {
                    throw new Error('Item not found');
                }
                
                const item = await response.json();
                return item;
            } catch (error) {
                addMessage(error.message, 'danger');
                console.error(`Error fetching item ${id}:`, error);
                return null;
            } finally {
                setLoading(false);
            }
        },
        
        // Update item
        async updateItem(id, itemData) {
            setLoading(true);
            try {
                const response = await fetch(`/api/items/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update item');
                }
                
                const updatedItem = await response.json();
                
                // Update item in state
                const updatedItems = state.items.map(item => 
                    item.id === id ? updatedItem : item
                );
                setItems(updatedItems);
                
                // Clear editing state
                setEditingItemId(null);
                
                addMessage('Item updated successfully', 'success');
                return updatedItem;
            } catch (error) {
                addMessage(error.message, 'danger');
                console.error(`Error updating item ${id}:`, error);
                return null;
            } finally {
                setLoading(false);
            }
        },
        
        // Delete item
        async deleteItem(id) {
            setLoading(true);
            try {
                const response = await fetch(`/api/items/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }
                
                // Remove item from state
                const updatedItems = state.items.filter(item => item.id !== id);
                setItems(updatedItems);
                
                addMessage('Item deleted successfully', 'success');
                return true;
            } catch (error) {
                addMessage(error.message, 'danger');
                console.error(`Error deleting item ${id}:`, error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        
        // Load version
        async loadVersion() {
            try {
                const response = await fetch('/api/version');
                const data = await response.json();
                setVersion(data.version);
                return data.version;
            } catch (error) {
                console.error('Error fetching version:', error);
                setVersion('?.?.?');
                return null;
            }
        }
    };
    
    // Public API
    return {
        getState,
        getItems,
        getVersion,
        getUI,
        subscribe,
        actions,
        // UI helpers
        setEditingItemId,
        addMessage,
        removeMessage
    };
})();

// Export for use in other files
window.AppState = AppState;
