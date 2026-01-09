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
import { GenreService } from '../../../../core/services/impl/genre.service';
import { Genre } from '../../../../core/models/genre.model';
import { GenreFormComponent } from '../genre-form/genre-form.component';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GenreFormComponent, FormsModule],
  templateUrl: './genre-list.component.html',
  styleUrl: './genre-list.component.scss',
})
export class GenreListComponent implements OnInit {
  private genreService = inject(GenreService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  genres: Genre[] = [];
  filteredGenres: Genre[] = [];
  searchTerm: string = '';
  showModal = false;
  selectedGenreId: number | null = null;
  showDeleteModal = false;
  genreToDeleteId: number | null = null;
  isLoading = true;
  showTopShadow = false;
  showBottomShadow = false;

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres() {
    this.isLoading = true;
    this.genreService.getAll().subscribe((data) => {
      this.genres = data;
      this.filterGenres();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  filterGenres() {
    if (!this.searchTerm) {
      this.filteredGenres = this.genres;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredGenres = this.genres.filter((g) =>
        g.name.toLowerCase().includes(lower)
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
    this.selectedGenreId = null;
    this.showModal = true;
  }

  openEditModal(id: number) {
    this.selectedGenreId = id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedGenreId = null;
  }

  onFormSave() {
    this.closeModal();
    this.loadGenres();
  }

  openDeleteModal(id: number) {
    this.genreToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.genreToDeleteId = null;
  }

  confirmDelete() {
    if (this.genreToDeleteId) {
      this.genreService
        .delete(this.genreToDeleteId.toString())
        .subscribe(() => {
          this.closeDeleteModal();
          this.loadGenres();
        });
    }
  }
}
