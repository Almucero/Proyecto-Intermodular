import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Game } from '../../../core/models/game.model';
import { GameCardComponent } from '../game-card/game-card.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TranslatePipe, GameCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() items: Game[] = [];
  @Input() sectionId: string = '';
  @Output() itemClick = new EventEmitter<number>();

  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLElement>;

  arrowState = { left: false, right: true };
  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

  constructor() {}

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollState(), 0);
  }

  getCoverUrl(game: Game): string {
    if (!game.media || game.media.length === 0) {
      return 'assets/images/placeholder.png';
    }
    const cover = game.media.find((m) =>
      m.originalName?.toLowerCase().includes('cover'),
    );
    return cover ? cover.url : game.media[0].url;
  }

  onItemClick(id: number): void {
    if (!this.isDragging) {
      this.itemClick.emit(id);
    }
  }

  scrollLeft(): void {
    const carousel = this.carouselContainer.nativeElement;
    carousel.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 350);
  }

  scrollRight(): void {
    const carousel = this.carouselContainer.nativeElement;
    carousel.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 350);
  }

  updateScrollState(): void {
    const carousel = this.carouselContainer.nativeElement;
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    this.arrowState = {
      left: scrollLeft > 1,
      right: scrollLeft < maxScrollLeft - 1,
    };
  }

  onMouseDown(e: MouseEvent): void {
    const carousel = this.carouselContainer.nativeElement;
    this.isDragging = false;
    this.startX = e.pageX - carousel.offsetLeft;
    this.scrollLeftPos = carousel.scrollLeft;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }

  onMouseUp(): void {
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  onMouseMove(e: MouseEvent): void {
    if (e.buttons !== 1) return;
    e.preventDefault();
    const carousel = this.carouselContainer.nativeElement;
    const x = e.pageX - carousel.offsetLeft;
    const walk = x - this.startX;
    carousel.scrollLeft = this.scrollLeftPos - walk;
    if (Math.abs(walk) > 5) {
      this.isDragging = true;
    }
  }
}
