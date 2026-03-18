import {
  Component,
  Input,
  forwardRef,
  signal,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Componente de carga de archivos con integración en formularios reactivos.
 *
 * Características:
 * - Implementa ControlValueAccessor para uso en formularios reactivos
 * - Soporte para click y drag & drop
 * - Preview visual para imágenes y PDFs
 * - Validación de tipos MIME
 * - Diseño responsivo con Tailwind CSS
 * - Estados visuales (hover, drag, error)
 *
 * @example
 * En el template:
 * <app-file-upload
 *   formControlName="avatar"
 *   [acceptedMimeTypes]="['image/png', 'image/jpeg']"
 *   placeholder="Arrastra tu foto aquí o haz clic para seleccionar">
 * </app-file-upload>
 *
 * En el componente:
 * this.form = this.fb.group({
 *   avatar: [null, Validators.required]
 * });
 */
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, OnDestroy {
  /** Lista de tipos MIME permitidos (ej: ['image/png', 'image/jpeg']). */
  @Input() acceptedMimeTypes: string[] = ['*/*'];

  /** Clave de traducción para el texto de sugerencia. */
  @Input() placeholder: string = 'common.upload.dragHere';

  /** Tamaño máximo permitido en MegaBytes. */
  @Input() maxSizeInMB: number = 10;
  /** Permite establecer una URL inicial para mostrar una previsualización existente. */
  @Input() set initialUrl(url: string | null | undefined) {
    if (url) {
      this.previewUrl.set(url);
    }
  }

  /** Signal que almacena el archivo seleccionado actualmente. */
  selectedFile = signal<File | null>(null);

  private translate = inject(TranslateService);

  /** URL para la previsualización del archivo (data URL o blob URL). */
  previewUrl = signal<string | null>(null);

  /** URL sanitizada específicamente para la vista previa de archivos PDF. */
  safePdfUrl = signal<SafeResourceUrl | null>(null);

  /** Indica si hay un archivo siendo arrastrado sobre el componente. */
  isDragging = signal<boolean>(false);

  /** Mensaje de error de validación (tipo incorrecto, tamaño excedido, etc.). */
  error = signal<string | null>(null);

  /** Indica si el componente está en modo solo lectura. */
  disabled = false;

  /** URL blob (object URL) interna para previsualizaciones. */
  private blobUrl: string | null = null;

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  private onChange: (file: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Implementación de writeValue para ControlValueAccessor.
   * Recibe el valor (archivo) desde el formulario.
   */
  writeValue(file: File | null): void {
    if (file) {
      this.selectedFile.set(file);
      this.generatePreview(file);
    } else {
      this.clearFile();
    }
  }

  registerOnChange(fn: (file: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Abre el selector de archivos nativo del navegador.
   */
  onAreaClick(): void {
    if (this.disabled || !isPlatformBrowser(this.platformId)) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.acceptedMimeTypes.join(',');
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    };
    input.click();
  }

  /** Maneja el inicio del arrastre sobre el componente. */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragging.set(true);
    }
  }

  /** Maneja cuando el arrastre sale del área del componente. */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  /**
   * Maneja el evento de soltar archivos (drop).
   * Procesa el primer archivo soltado si no está deshabilitado.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Procesa, valida y genera la previsualización del archivo.
   * Notifica el cambio al formulario reactivo.
   * @param file Archivo a procesar.
   */
  private handleFile(file: File): void {
    this.error.set(null);

    if (!this.validateMimeType(file)) {
      this.error.set(
        `${this.translate.instant(
          'errors.fileTypeNotAllowed',
        )} ${this.acceptedMimeTypes.join(', ')}`,
      );
      return;
    }

    if (!this.validateSize(file)) {
      this.error.set(
        `${this.translate.instant('errors.fileTooLarge')} ${this.maxSizeInMB}MB`,
      );
      return;
    }

    this.selectedFile.set(file);
    this.generatePreview(file);
    this.onChange(file);
    this.onTouched();
  }

  /** Valida el tipo MIME contra la lista blanca. */
  private validateMimeType(file: File): boolean {
    if (this.acceptedMimeTypes.includes('*/*')) return true;

    return this.acceptedMimeTypes.some((mimeType) => {
      if (mimeType.endsWith('/*')) {
        const baseType = mimeType.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === mimeType;
    });
  }

  /** Valida que el archivo no supere el tamaño máximo. */
  private validateSize(file: File): boolean {
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Genera la previsualización del archivo.
   * Usa FileReader para imágenes y object URLs para PDFs.
   * @param file Archivo del que generar la preview.
   */
  private generatePreview(file: File): void {
    this.revokeBlobUrl();

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
        this.safePdfUrl.set(null);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      this.blobUrl = URL.createObjectURL(file);
      this.safePdfUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl),
      );
      this.previewUrl.set(this.blobUrl);
    } else {
      this.previewUrl.set(null);
      this.safePdfUrl.set(null);
    }
  }

  /**
   * Resetea el componente, eliminando el archivo seleccionado y liberando memoria.
   */
  clearFile(): void {
    this.revokeBlobUrl();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.safePdfUrl.set(null);
    this.error.set(null);
    this.onChange(null);
  }

  /** Cancela la URL del objeto blob para evitar fugas de memoria. */
  private revokeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  /** Limpia recursos al destruir el componente. */
  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  /** Indica si hay una imagen cargada. */
  isImage(): boolean {
    return this.selectedFile()?.type.startsWith('image/') || false;
  }

  /** Indica si hay un PDF cargado. */
  isPDF(): boolean {
    return this.selectedFile()?.type === 'application/pdf' || false;
  }

  /**
   * Formatea el tamaño en bytes a una cadena legible (KB, MB, etc.).
   * @param bytes Tamaño en bytes.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // eslint-disable-next-line security/detect-object-injection
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene un emoji descriptivo según el tipo de archivo.
   */
  getFileIcon(): string {
    const file = this.selectedFile();
    if (!file) return '📄';

    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📕';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type.includes('zip') || file.type.includes('compressed'))
      return '📦';
    if (file.type.includes('document') || file.type.includes('word'))
      return '📝';
    if (file.type.includes('spreadsheet') || file.type.includes('excel'))
      return '📊';

    return '📄';
  }
}
