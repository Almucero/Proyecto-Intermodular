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
import { GenreService } from '../../../../core/services/impl/genre.service';
import { Genre } from '../../../../core/models/genre.model';

/**
 * Componente de formulario para la creación y edición de géneros.
 */
@Component({
  selector: 'app-genre-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './genre-form.component.html',
  styleUrl: './genre-form.component.scss',
})
export class GenreFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private genreService = inject(GenreService);

  /** ID del género a editar. Si es null, el formulario actúa en modo creación. */
  @Input() genreId: number | null = null;
  /** Evento emitido cuando el género se guarda correctamente. */
  @Output() save = new EventEmitter<void>();
  /** Evento emitido al cancelar la edición. */
  @Output() cancel = new EventEmitter<void>();

  /** Grupo de formulario reactivo con validaciones para el género. */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  /** Indica si el formulario está en modo edición. */
  isEditMode = false;
  /** Mensaje de error para mostrar si falla el guardado. */
  errorMessage: string | null = null;

  /** Inicialización del componente. */
  ngOnInit(): void {
    if (this.genreId) {
      this.isEditMode = true;
      this.loadGenre(this.genreId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

  /** Responde a los cambios en el ID de entrada para cambiar entre modos. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['genreId']) {
      if (this.genreId) {
        this.isEditMode = true;
        this.loadGenre(this.genreId);
      } else {
        this.isEditMode = false;
        this.form.reset();
      }
    }
  }

  /** Carga la información de un género existente desde el servidor. */
  loadGenre(id: number) {
    this.genreService.getById(id.toString()).subscribe((genre) => {
      if (genre) {
        this.form.patchValue(genre);
      }
    });
  }

  /**
   * Procesa el envío del formulario.
   * Ejecuta una operación de adición o actualización según el modo.
   */
  onSubmit() {
    if (this.form.invalid) return;

    const genreData: Genre = {
      id: this.genreId ? this.genreId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.genreService.update(this.genreId!.toString(), genreData)
      : this.genreService.add(genreData);

    request$.subscribe(() => {
      this.save.emit();
    });
  }

  /** Cancela la operación y cierra el formulario. */
  onCancel() {
    this.cancel.emit();
  }
}
