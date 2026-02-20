export function dataURLtoBlob(dataUrl: string, callback: (blob: Blob) => void) {
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
