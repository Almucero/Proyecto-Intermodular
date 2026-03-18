import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../core/services/impl/platform.service';
import { Platform } from '../../../../core/models/platform.model';

/**
 * Componente de formulario para la gestión de plataformas de videojuegos.
 * Soporta operaciones de creación y actualización de registros.
 */
@Component({
  selector: 'app-platform-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './platform-form.component.html',
  styleUrl: './platform-form.component.scss',
})
export class PlatformFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private platformService = inject(PlatformService);

  /** ID de la plataforma a editar. Si es null, el formulario opera en modo creación. */
  @Input() platformId: number | null = null;
  /** Evento emitido cuando la plataforma se guarda con éxito. */
  @Output() save = new EventEmitter<void>();
  /** Evento emitido cuando el usuario cancela la operación. */
  @Output() cancel = new EventEmitter<void>();

  /** Formulario reactivo para los datos de la plataforma. */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
  });

  /** Indica si el componente está en modo edición. */
  isEditMode = false;
  /** Almacena mensajes de error en caso de fallo durante el guardado. */
  errorMessage: string | null = null;

  /** Inicialización del componente. */
  ngOnInit(): void {
    if (this.platformId) {
      this.isEditMode = true;
      this.loadPlatform(this.platformId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

  /** Detecta cambios en el ID de entrada para conmutar entre creación y edición. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['platformId']) {
      if (this.platformId) {
        this.isEditMode = true;
        this.loadPlatform(this.platformId);
      } else {
        this.isEditMode = false;
        this.form.reset();
      }
    }
  }

  /** Carga los datos de una plataforma específica desde el servidor. */
  loadPlatform(id: number) {
    this.platformService.getById(id.toString()).subscribe((platform) => {
      if (platform) {
        this.form.patchValue(platform);
      }
    });
  }

  /**
   * Procesa el envío del formulario.
   * Realiza una petición de creación o actualización basándose en el modo actual.
   */
  onSubmit() {
    if (this.form.invalid) return;

    const platformData: Platform = {
      id: this.platformId ? this.platformId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.platformService.update(this.platformId!.toString(), platformData)
      : this.platformService.add(platformData);

    request$.subscribe({
      next: () => this.save.emit(),
      error: (err) => (this.errorMessage = 'Error saving platform'),
    });
  }

  /** Informa al componente padre de la cancelación de la operación. */
  onCancel() {
    this.cancel.emit();
  }
}
