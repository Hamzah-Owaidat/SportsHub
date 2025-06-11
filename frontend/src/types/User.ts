import { Role } from './Role';
export interface User {
  _id: string;
  username: string;
  isActive: boolean;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: Role;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}