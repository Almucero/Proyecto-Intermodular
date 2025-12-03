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
import { Game } from '../../../core/models/game.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
})
export class GameCardComponent implements AfterViewInit {
  @Input() game!: Game;
  @Input() coverUrl!: string;
  @Output() cardClick = new EventEmitter<number>();

  @ViewChild('gameTitle') gameTitleElement!: ElementRef;

  hoveredGameId: number | null = null;
  safeVideoUrl: SafeUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit(): void {
    // Check if title is long and needs animation
    window.requestAnimationFrame(() => this.checkLongTitle());
  }

  checkLongTitle(): void {
    if (this.gameTitleElement) {
      const spanElement = this.gameTitleElement
        .nativeElement as HTMLSpanElement;
      const containerElement = spanElement.parentElement as HTMLElement;

      if (spanElement.scrollWidth > containerElement.clientWidth + 1) {
        spanElement.classList.add('long-text-animate');
      } else {
        spanElement.classList.remove('long-text-animate');
      }
    }
  }

  onGameMouseEnter(): void {
    this.hoveredGameId = this.game.id;
    if (this.game.videoUrl) {
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustUrl(
        this.game.videoUrl
      );
    }
  }

  onGameMouseLeave(): void {
    this.hoveredGameId = null;
    this.safeVideoUrl = null;
  }

  onClick(): void {
    this.cardClick.emit(this.game.id);
  }
}
