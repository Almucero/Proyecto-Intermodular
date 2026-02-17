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

  @Input() genreId: number | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  isEditMode = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this.genreId) {
      this.isEditMode = true;
      this.loadGenre(this.genreId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

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

  loadGenre(id: number) {
    this.genreService.getById(id.toString()).subscribe((genre) => {
      if (genre) {
        this.form.patchValue(genre);
      }
    });
  }

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

  onCancel() {
    this.cancel.emit();
  }
}
