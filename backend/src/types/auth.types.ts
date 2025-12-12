// Interface untuk data pengguna yang masuk (request body)
export interface UserInput {
    username: string;
    email: string;
    password: string;
}

// Interface untuk data pengguna yang disimpan/dikembalikan
export interface UserPayload {
    id_user: number;
    username: string;
    email:
    string;
}