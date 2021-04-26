export interface UserLogin{

    accessToken: string;
    data: User;
    expiresIn: string;
    refreshToken: string;
    scope: string;
    tokenType: string;
}


export interface User{
    id: string;
    phoneNumber: string;
}

export interface UserProfile{
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}
