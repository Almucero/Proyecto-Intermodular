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
  @Input() acceptedMimeTypes: string[] = ['*/*'];

  @Input() placeholder: string = 'common.upload.dragHere';

  @Input() maxSizeInMB: number = 10;
  @Input() set initialUrl(url: string | null | undefined) {
    if (url) {
      this.previewUrl.set(url);
    }
  }

  selectedFile = signal<File | null>(null);

  private translate = inject(TranslateService);

  previewUrl = signal<string | null>(null);

  /** URL sanitizada para PDFs (necesaria para iframes) */
  safePdfUrl = signal<SafeResourceUrl | null>(null);

  isDragging = signal<boolean>(false);

  error = signal<string | null>(null);

  disabled = false;

  /** URL blob creada con createObjectURL que debe ser liberada */
  private blobUrl: string | null = null;

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  private onChange: (file: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Escribe un valor en el componente (desde el FormControl).
   */
  writeValue(file: File | null): void {
    if (file) {
      this.selectedFile.set(file);
      this.generatePreview(file);
    } else {
      this.clearFile();
    }
  }

  /**
   * Registra la función de callback para cambios de valor.
   */
  registerOnChange(fn: (file: File | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Registra la función de callback para el evento touched.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Establece el estado deshabilitado del componente.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Maneja el evento click en el área de drop.
   * Abre el selector de archivos del sistema.
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

  /**
   * Maneja el evento dragover.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragging.set(true);
    }
  }

  /**
   * Maneja el evento dragleave.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  /**
   * Maneja el evento drop de archivos.
   */
  onDrop(event: DragEvent): void {
    //
    // - `event.preventDefault()`: Previene el comportamiento por defecto del navegador, que normalmente abriría el archivo arrastrado en vez de permitir que el componente lo gestione.
    // - `event.stopPropagation()`: Detiene la propagación del evento hacia otros elementos padres. Esto asegura que solo el componente maneje el evento y evita efectos no deseados en elementos contenedores en la jerarquía del DOM.
    //
    // Ambas llamadas son necesarias para proporcionar una experiencia de usuario consistente y controlar totalmente el flujo de arrastrar y soltar archivos en el componente.
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
   * Procesa el archivo seleccionado.
   * Valida tipo MIME, tamaño y genera preview.
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

  /**
   * Valida que el tipo MIME del archivo sea aceptado.
   */
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

  /**
   * Valida el tamaño del archivo.
   */
  private validateSize(file: File): boolean {
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Genera una preview del archivo si es posible.
   *
   * Para imágenes: Usa FileReader.readAsDataURL() para crear una data URL.
   * Para PDFs: Usa URL.createObjectURL() para crear una blob URL que funciona mejor con iframes.
   *
   * Las blob URLs son más eficientes y no tienen las restricciones de seguridad
   * que pueden tener las data URLs en iframes.
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
   * Limpia el archivo seleccionado y libera recursos.
   */
  clearFile(): void {
    this.revokeBlobUrl();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.safePdfUrl.set(null);
    this.error.set(null);
    this.onChange(null);
  }

  /**
   * Libera la URL blob para evitar memory leaks.
   * Las blob URLs deben ser revocadas manualmente cuando ya no se necesiten.
   */
  private revokeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  /**
   * Lifecycle hook que se ejecuta al destruir el componente.
   * Importante para liberar la URL blob y evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  /**
   * Determina si el archivo actual es una imagen.
   */
  isImage(): boolean {
    return this.selectedFile()?.type.startsWith('image/') || false;
  }

  /**
   * Determina si el archivo actual es un PDF.
   */
  isPDF(): boolean {
    return this.selectedFile()?.type === 'application/pdf' || false;
  }

  /**
   * Formatea el tamaño del archivo para visualización.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene un icono según el tipo de archivo.
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
