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
import { DeveloperService } from '../../../../core/services/impl/developer.service';
import { Developer } from '../../../../core/models/developer.model';

/**
 * Componente de formulario para la creación y edición de desarrolladores.
 */
@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './developer-form.component.html',
  styleUrl: './developer-form.component.scss',
})
export class DeveloperFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private developerService = inject(DeveloperService);

  /** ID del desarrollador a editar. Si es null, el formulario actúa en modo creación. */
  @Input() developerId: number | null = null;
  /** Evento emitido cuando el desarrollador se guarda correctamente. */
  @Output() save = new EventEmitter<void>();
  /** Evento emitido al cancelar la edición. */
  @Output() cancel = new EventEmitter<void>();

  /** Grupo de formulario reactivo con validaciones para el desarrollador. */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  /** Indica si el formulario está en modo edición. */
  isEditMode = false;
  /** Mensaje de error para mostrar si falla el guardado. */
  errorMessage: string | null = null;

  /** Inicialización del componente. */
  ngOnInit(): void {
    if (this.developerId) {
      this.isEditMode = true;
      this.loadDeveloper(this.developerId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

  /** Responde a los cambios en el ID de entrada para cambiar entre modos. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['developerId']) {
      if (this.developerId) {
        this.isEditMode = true;
        this.loadDeveloper(this.developerId);
      } else {
        this.isEditMode = false;
        this.form.reset();
      }
    }
  }

  /** Carga la información de un desarrollador existente desde el servidor. */
  loadDeveloper(id: number) {
    this.developerService.getById(id.toString()).subscribe((developer) => {
      if (developer) {
        this.form.patchValue(developer);
      }
    });
  }

  /**
   * Procesa el envío del formulario.
   * Ejecuta una operación de adición o actualización según el modo.
   */
  onSubmit() {
    if (this.form.invalid) return;

    const developerData: Developer = {
      id: this.developerId ? this.developerId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.developerService.update(this.developerId!.toString(), developerData)
      : this.developerService.add(developerData);

    request$.subscribe(() => {
      this.save.emit();
    });
  }

  /** Cancela la operación y cierra el formulario. */
  onCancel() {
    this.cancel.emit();
  }
}
