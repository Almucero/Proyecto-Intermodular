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

  @Input() publisherId: number | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
  });

  isEditMode = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this.publisherId) {
      this.isEditMode = true;
      this.loadPublisher(this.publisherId);
    } else {
      this.isEditMode = false;
      this.form.reset();
    }
  }

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

  loadPublisher(id: number) {
    this.publisherService.getById(id.toString()).subscribe((pub) => {
      if (pub) {
        this.form.patchValue(pub);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const pubData: Publisher = {
      id: this.publisherId ? this.publisherId : 0,
      ...this.form.value,
    };

    const request$ = this.isEditMode
      ? this.publisherService.update(this.publisherId!.toString(), pubData)
      : this.publisherService.add(pubData);

    request$.subscribe({
      next: () => this.save.emit(),
      error: (err) => (this.errorMessage = 'Error saving publisher'),
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
