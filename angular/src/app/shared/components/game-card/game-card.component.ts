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
import type { Game } from '../../../core/models/game.model';
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
  @Input() fullWidth: boolean = false;
  @Output() cardClick = new EventEmitter<number>();

  @ViewChild('gameTitle') gameTitleElement!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    window.requestAnimationFrame(() => this.checkLongTitle());
  }

  checkLongTitle(): void {
    if (this.gameTitleElement) {
      const spanElement = this.gameTitleElement
        .nativeElement as HTMLSpanElement;
      const containerElement = spanElement.parentElement as HTMLElement;

      const overflow = spanElement.scrollWidth - containerElement.clientWidth;

      if (overflow > 0) {
        spanElement.style.setProperty('--scroll-distance', `-${overflow}px`);
        spanElement.classList.add('long-text-animate');
        containerElement.classList.add('fade-mask');
      } else {
        spanElement.classList.remove('long-text-animate');
        spanElement.style.removeProperty('--scroll-distance');
        containerElement.classList.remove('fade-mask');
      }
    }
  }

  onClick(): void {
    this.cardClick.emit(this.game.id);
  }
}
