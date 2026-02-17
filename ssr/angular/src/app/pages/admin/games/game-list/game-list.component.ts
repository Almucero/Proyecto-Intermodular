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
import { GameService } from '../../../../core/services/impl/game.service';
import { Game } from '../../../../core/models/game.model';
import { GameFormComponent } from '../game-form/game-form.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GameFormComponent, FormsModule],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss',
})
export class GameListComponent implements OnInit {
  private gameService = inject(GameService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  games: Game[] = [];
  filteredGames: Game[] = [];
  searchTerm: string = '';
  showModal = false;
  selectedGameId: number | null = null;
  showDeleteModal = false;
  gameToDeleteId: number | null = null;
  isLoading = true;
  showTopShadow = false;
  showBottomShadow = false;

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames() {
    this.isLoading = true;
    this.gameService.getAll().subscribe((data) => {
      this.games = data;
      this.filterGames();
      this.isLoading = false;
      setTimeout(() => {
        this.onScroll();
      }, 0);
    });
  }

  filterGames() {
    if (!this.searchTerm) {
      this.filteredGames = this.games;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredGames = this.games.filter((g) =>
        g.title.toLowerCase().includes(lower)
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
    this.selectedGameId = null;
    this.showModal = true;
  }

  openEditModal(id: number) {
    this.selectedGameId = id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedGameId = null;
  }

  onFormSave() {
    this.closeModal();
    this.loadGames();
  }

  openDeleteModal(id: number) {
    this.gameToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.gameToDeleteId = null;
  }

  confirmDelete() {
    if (this.gameToDeleteId) {
      this.gameService.delete(this.gameToDeleteId.toString()).subscribe(() => {
        this.closeDeleteModal();
        this.loadGames();
      });
    }
  }
}
