import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DeveloperService } from '../../../../core/services/impl/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { DeveloperFormComponent } from '../developer-form/developer-form.component';

@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, DeveloperFormComponent, FormsModule],
  templateUrl: './developer-list.component.html',
  styleUrl: './developer-list.component.scss',
})
export class DeveloperListComponent implements OnInit {
  private developerService = inject(DeveloperService);
  developers: Developer[] = [];
  filteredDevelopers: Developer[] = [];
  searchTerm: string = '';

  showModal = false;
  selectedDeveloperId: number | null = null;

  showDeleteModal = false;
  developerToDeleteId: number | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadDevelopers();
  }

  loadDevelopers() {
    this.isLoading = true;
    this.developerService.getAll().subscribe((data) => {
      this.developers = data;
      this.filterDevelopers();
      this.isLoading = false;
    });
  }

  filterDevelopers() {
    if (!this.searchTerm) {
      this.filteredDevelopers = this.developers;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredDevelopers = this.developers.filter((d) =>
        d.name.toLowerCase().includes(lower)
      );
    }
  }

  openCreateModal() {
    this.selectedDeveloperId = null;
    this.showModal = true;
  }

  openEditModal(id: number) {
    this.selectedDeveloperId = id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDeveloperId = null;
  }

  onFormSave() {
    this.closeModal();
    this.loadDevelopers();
  }

  openDeleteModal(id: number) {
    this.developerToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.developerToDeleteId = null;
  }

  confirmDelete() {
    if (this.developerToDeleteId) {
      this.developerService
        .delete(this.developerToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadDevelopers();
        });
    }
  }
}
