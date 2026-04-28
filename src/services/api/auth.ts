import axiosInstance from '../http';
import type { User } from '../../types/mindmap';

export interface GoogleLoginResponse {
    token: string;
    user: User;
}

export const loginWithGoogle = async (idToken: string) => {
    const { data } = await axiosInstance.post<GoogleLoginResponse>('/auth/google-login', {
        id_token: idToken,
    });
    return data;
};
