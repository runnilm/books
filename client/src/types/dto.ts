export type UserDTO = {
    id: number;
    username: string;
    is_admin: boolean;
};

export type MeResponse = {
    user: UserDTO | null;
};

export type AuthResponse = {
    user: UserDTO;
};

export type BookDTO = {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    updated_at?: string;
    added_at?: string;
};
