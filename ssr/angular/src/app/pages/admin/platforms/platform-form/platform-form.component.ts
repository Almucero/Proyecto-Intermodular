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

  @Input() platformId: number | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
  });

  isEditMode = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this.platformId) {
      this.isEditMode = true;
      this.loadPlatform(this.platformId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

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

  loadPlatform(id: number) {
    this.platformService.getById(id.toString()).subscribe((platform) => {
      if (platform) {
        this.form.patchValue(platform);
      }
    });
  }

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

  onCancel() {
    this.cancel.emit();
  }
}
