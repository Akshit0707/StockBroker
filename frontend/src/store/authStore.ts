import { create } from "zustand";
import { User } from "../types/user";
import { connectSocket, disconnectSocket } from "../services/websocket";


interface authStore{
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;


    login:(user:User,token:string)=>void;
    logout:()=>void;
    updateUser:(user:Partial<User>)=>void;

    initialize:()=>void;
}
    const useAuthStore = create<authStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, 
  
  login: (user: User, token: string) => {
    localStorage.setItem("token", token);
 
    localStorage.setItem("user", JSON.stringify(user));
    connectSocket(token);
    set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (user: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            set({ user: updatedUser });
        }
    },
    initialize: () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user) {
            connectSocket(token);
            set({ token, user: JSON.parse(user), isAuthenticated: true, isLoading: false });
        } else {
            set({ isLoading: false });
        }
    },
}));

export default useAuthStore;


