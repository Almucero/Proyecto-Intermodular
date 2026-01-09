import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PublisherService } from '../../../../core/services/impl/publisher.service';
import { Publisher } from '../../../../core/models/publisher.model';
import { PublisherFormComponent } from '../publisher-form/publisher-form.component';

@Component({
  selector: 'app-publisher-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PublisherFormComponent, FormsModule],
  templateUrl: './publisher-list.component.html',
  styleUrl: './publisher-list.component.scss',
})
export class PublisherListComponent implements OnInit {
  private publisherService = inject(PublisherService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  publishers: Publisher[] = [];
  filteredPublishers: Publisher[] = [];
  searchTerm: string = '';
  showModal = false;
  selectedPublisherId: number | null = null;
  showDeleteModal = false;
  publisherToDeleteId: number | null = null;
  isLoading = true;
  showTopShadow = false;
  showBottomShadow = false;

  ngOnInit(): void {
    this.loadPublishers();
  }

  loadPublishers() {
    this.isLoading = true;
    this.publisherService.getAll().subscribe((data) => {
      this.publishers = data;
      this.filterPublishers();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  filterPublishers() {
    if (!this.searchTerm) {
      this.filteredPublishers = this.publishers;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredPublishers = this.publishers.filter((p) =>
        p.name.toLowerCase().includes(lower)
      );
    }
    setTimeout(() => {
      this.onScroll();
    }, 0);
  }

  onScroll() {
    if (!this.scrollContainer) return;
    const element = this.scrollContainer.nativeElement;
    this.showTopShadow = element.scrollTop > 0;
    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    this.showBottomShadow =
      !atBottom && element.scrollHeight > element.clientHeight;
  }

  openCreateModal() {
    this.selectedPublisherId = null;
    this.showModal = true;
  }

  openEditModal(id: number) {
    this.selectedPublisherId = id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPublisherId = null;
  }

  onFormSave() {
    this.closeModal();
    this.loadPublishers();
  }

  openDeleteModal(id: number) {
    this.publisherToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.publisherToDeleteId = null;
  }

  confirmDelete() {
    if (this.publisherToDeleteId) {
      this.publisherService
        .delete(this.publisherToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadPublishers();
        });
    }
  }
}
