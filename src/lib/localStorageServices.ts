const LocalStorageService = {
    setItem: (key: any, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item ${key} in local storage:`, error);
        }
    },
    getItem: (key: any) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting item ${key} from local storage:`, error);
            return null;
        }
    },

    removeItem: (key: any) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key} from local storage:`, error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing local storage:', error);
        }
    }
};

export { LocalStorageService };
