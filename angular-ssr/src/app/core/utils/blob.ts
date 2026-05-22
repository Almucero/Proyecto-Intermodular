/*
 * @file: src/app/core/utils/blob.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Utilidades para la conversión de data URLs en Blobs.
 */

/**
 * Convierte un data URL en un Blob conservando su mime type.
 * @param dataUrl URL codificada (base64 o data URI).
 * @param callback Callback que recibe el Blob resultante.
 */
export function dataURLtoBlob(dataUrl: string, callback: (blob: Blob) => void): void {
  var req = new XMLHttpRequest();

  req.open('GET', dataUrl);
  req.responseType = 'arraybuffer';

  req.onload = function fileLoaded(e) {
    // If you require the blob to have correct mime type
    var mime = this.getResponseHeader('content-type');

    callback(new Blob([this.response], { type: mime || undefined }));
  };

  req.send();
}
