import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../core/services/impl/platform.service';
import { Platform } from '../../../../core/models/platform.model';
import { PlatformFormComponent } from '../platform-form/platform-form.component';

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PlatformFormComponent, FormsModule],
  templateUrl: './platform-list.component.html',
  styleUrl: './platform-list.component.scss',
})
export class PlatformListComponent implements OnInit {
  private platformService = inject(PlatformService);
  platforms: Platform[] = [];
  filteredPlatforms: Platform[] = [];
  searchTerm: string = '';

  showModal = false;
  selectedPlatformId: number | null = null;

  showDeleteModal = false;
  platformToDeleteId: number | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms() {
    this.isLoading = true;
    this.platformService.getAll().subscribe((data) => {
      this.platforms = data;
      this.filterPlatforms();
      this.isLoading = false;
    });
  }

  filterPlatforms() {
    if (!this.searchTerm) {
      this.filteredPlatforms = this.platforms;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredPlatforms = this.platforms.filter((p) =>
        p.name.toLowerCase().includes(lower)
      );
    }
  }

  openCreateModal() {
    this.selectedPlatformId = null;
    this.showModal = true;
  }

  openEditModal(id: number) {
    this.selectedPlatformId = id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPlatformId = null;
  }

  onFormSave() {
    this.closeModal();
    this.loadPlatforms();
  }

  openDeleteModal(id: number) {
    this.platformToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.platformToDeleteId = null;
  }

  confirmDelete() {
    if (this.platformToDeleteId) {
      this.platformService
        .delete(this.platformToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadPlatforms();
        });
    }
  }
}
