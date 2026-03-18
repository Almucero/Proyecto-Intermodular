import { Model } from './base.model';
import { Game } from './game.model';
import { User } from './user.model';

/**
 * Representa un recurso multimedia (imagen o vídeo) almacenado en la nube.
 */
export interface Media extends Model {
  /** URL pública de acceso al recurso. */
  url: string;
  /** Identificador público de Cloudinary. */
  publicId?: string | null;
  /** Formato del archivo (jpg, png, mp4, etc.). */
  format?: string | null;
  /** Tipo de recurso (image, video). */
  resourceType?: string | null;
  /** Tamaño del archivo en bytes. */
  bytes?: number | null;
  /** Ancho de la imagen en píxeles. */
  width?: number | null;
  /** Alto de la imagen en píxeles. */
  height?: number | null;
  /** Nombre original del archivo subido. */
  originalName?: string | null;
  /** Carpeta de almacenamiento en el servicio remoto. */
  folder?: string | null;
  /** Texto alternativo para accesibilidad. */
  altText?: string | null;
  /** ID del juego asociado (si aplica). */
  gameId?: number | null;
  /** Objeto del juego asociado. */
  Game?: Game | null;
  /** ID del usuario asociado (ej. foto de perfil). */
  userId?: number | null;
  /** Objeto del usuario asociado. */
  User?: User | null;
}
