import {create} from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { response } from 'express';

// creating a user global state store using zustand
export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    // signup function
    signup: async ({name, email, password, confirmPassword}) => {
        set({ loading: true });

        if(password !== confirmPassword) {
            toast.error("Passwords do not match");
            set({ loading: false });
            return;
        }

        try {
            const res = await axios.post('/auth/signup', {name, email, password});
            toast.success("Account created successfully");
            set({ user: res.data.user, loading: false});
            
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred, please try again");
        }
    },

    // login function
    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await axios.post('/auth/login', {email, password});
            toast.success("Login successful");
            set({ user: res.data.user, loading: false});
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred, please try again");
        }
    }, 

    // check auth
    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const res = await axios.get('/auth/profile');
            set({ user: res.data, checkingAuth: false });
        }
        catch (error) {
            set({ checkingAuth: false, user: null });
        }
    }
}));

