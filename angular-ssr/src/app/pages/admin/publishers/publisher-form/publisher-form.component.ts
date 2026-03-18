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
import { PublisherService } from '../../../../core/services/impl/publisher.service';
import { Publisher } from '../../../../core/models/publisher.model';

/**
 * Componente de formulario para la creación y edición de editores (publishers).
 */
@Component({
  selector: 'app-publisher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './publisher-form.component.html',
  styleUrl: './publisher-form.component.scss',
})
export class PublisherFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private publisherService = inject(PublisherService);

  /** ID del editor a editar. Si es null, el formulario actúa en modo creación. */
  @Input() publisherId: number | null = null;
  /** Evento emitido cuando el editor se guarda correctamente. */
  @Output() save = new EventEmitter<void>();
  /** Evento emitido al cancelar la edición. */
  @Output() cancel = new EventEmitter<void>();

  /** Grupo de formulario reactivo con validaciones para el editor. */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  /** Indica si el formulario está en modo edición. */
  isEditMode = false;
  /** Mensaje de error para mostrar si falla el guardado. */
  errorMessage: string | null = null;

  /** Inicialización del componente. */
  ngOnInit(): void {
    if (this.publisherId) {
      this.isEditMode = true;
      this.loadPublisher(this.publisherId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

  /** Detecta cambios en el ID de entrada para conmutar entre creación y edición. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publisherId']) {
      if (this.publisherId) {
        this.isEditMode = true;
        this.loadPublisher(this.publisherId);
      } else {
        this.isEditMode = false;
        this.form.reset();
      }
    }
  }

  /** Carga la información de un editor existente desde el servidor. */
  loadPublisher(id: number) {
    this.publisherService.getById(id.toString()).subscribe((publisher) => {
      if (publisher) {
        this.form.patchValue(publisher);
      }
    });
  }

  /**
   * Procesa el envío del formulario.
   * Realiza una petición de creación o actualización basándose en el modo actual.
   */
  onSubmit() {
    if (this.form.invalid) return;

    const publisherData: Publisher = {
      id: this.publisherId ? this.publisherId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.publisherService.update(this.publisherId!.toString(), publisherData)
      : this.publisherService.add(publisherData);

    request$.subscribe({
      next: () => this.save.emit(),
      error: () => (this.errorMessage = 'Error saving publisher'),
    });
  }

  /** Informa al componente padre de la cancelación de la operación. */
  onCancel() {
    this.cancel.emit();
  }
}
