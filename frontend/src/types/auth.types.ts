export interface RegisterFormInput {
    username: string;
    email: string;
    password: string;
}

export interface LoginFormInput {
    email: string;
    password: string;
}

export interface UserPayload {
    id_user: number;
    username: string;
    email: string;
}

export interface AuthResponse { 
    message: string;
    token: string;
    user: UserPayload;
}

export interface ProfileUpdateInput {
    username?: string;
    email?: string;
}

export interface PasswordUpdateInput {
    currentPassword: string;
    newPassword: string;
}