export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  surname?: string;
}

//esto es basura infecta (por cambiar)
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  profileImage?: string;
  username?: string;
}
