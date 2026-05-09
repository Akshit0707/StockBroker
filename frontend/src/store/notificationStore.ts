import { create } from "zustand";

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number; 
}

interface NotificationStore {
    notifications: Notification[];
    addNotification(notification: Omit<Notification, 'id'>): void;
    removeNotification(id: string): void;
    clearAll:() => void;
}

const useNotificationStore=create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id }],
        }));

        if (notification.duration) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, notification.duration);
        }
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
    clearAll: () => {
        set({ notifications: [] });
    }
}));

export default useNotificationStore;