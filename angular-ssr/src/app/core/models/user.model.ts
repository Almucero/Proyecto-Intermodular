import { Model } from './base.model';
import { Media } from './media.model';
import { CartItem } from './cart-item.model';
import { Purchase } from './purchase.model';
import { Favorite } from './favorite.model';

/**
 * Representa un usuario en el sistema Game Sage.
 */
export interface User extends Model {
  /** ID de la cuenta externa (si aplica). */
  accountId?: string | null;
  /** Fecha de creación de la cuenta externa. */
  accountAt?: string | null;
  /** Correo electrónico único del usuario. */
  email: string;
  /** Apodo o nombre de usuario. */
  nickname?: string | null;
  /** Nombre del usuario. */
  name: string;
  /** Apellidos del usuario. */
  surname?: string | null;
  /** Hash de la contraseña (solo en backend). */
  passwordHash?: string;
  /** Saldo actual en la cartera del usuario. */
  balance?: number | null;
  /** Puntos acumulados en el programa de fidelización. */
  points?: number;
  /** Indica si el usuario tiene privilegios de administrador. */
  isAdmin?: boolean;
  /** Primera línea de la dirección de envío. */
  addressLine1?: string | null;
  /** Segunda línea de la dirección de envío. */
  addressLine2?: string | null;
  /** Ciudad de residencia. */
  city?: string | null;
  /** Región o provincia. */
  region?: string | null;
  /** Código postal. */
  postalCode?: string | null;
  /** País de residencia. */
  country?: string | null;
  /** Lista de recursos multimedia asociados al usuario (ej. foto de perfil). */
  media?: Media[];
  /** Artículos actualmente en el carrito de compras. */
  cartItems?: CartItem[];
  /** Historial de compras realizadas. */
  purchases?: Purchase[];
  /** Lista de juegos favoritos del usuario. */
  favorites?: Favorite[];
}

/**
 * Datos necesarios para el inicio de sesión.
 */
export interface SignInPayload {
  /** Correo electrónico del usuario. */
  email: string;
  /** Contraseña en texto plano. */
  password: string;
  /** Indica si se debe mantener la sesión iniciada. */
  rememberMe?: boolean;
}

/**
 * Datos necesarios para el registro de un nuevo usuario.
 */
export interface SignUpPayload {
  /** Correo electrónico único. */
  email: string;
  /** Contraseña elegida. */
  password: string;
  /** Nombre del nuevo usuario. */
  name: string;
  /** Apellidos del nuevo usuario (opcional). */
  surname?: string;
}
