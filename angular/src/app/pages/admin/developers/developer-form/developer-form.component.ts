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

  @Input() developerId: number | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
  });

  isEditMode = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this.developerId) {
      this.isEditMode = true;
      this.loadDeveloper(this.developerId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

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

  loadDeveloper(id: number) {
    this.developerService.getById(id.toString()).subscribe((dev) => {
      if (dev) {
        this.form.patchValue(dev);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const devData: Developer = {
      id: this.developerId ? this.developerId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.developerService.update(this.developerId!.toString(), devData)
      : this.developerService.add(devData);

    request$.subscribe({
      next: () => this.save.emit(),
      error: (err) => (this.errorMessage = 'Error saving developer'),
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
