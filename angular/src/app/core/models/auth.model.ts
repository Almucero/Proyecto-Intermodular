export interface SignInPayload {
  email: string;
  password: string;
}

//esto es basura infecta
export interface User {
  name: string;
  surname: string;
  email: string;
  profileImage?: string;
  username?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  surname?: string;
}
