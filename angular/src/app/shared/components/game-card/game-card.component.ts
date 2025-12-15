import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
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
export class GameCardComponent implements AfterViewInit, OnDestroy {
  @Input() game!: Game;
  @Input() coverUrl!: string;
  @Input() fullWidth: boolean = false;
  @Output() cardClick = new EventEmitter<number>();

  @ViewChild('gameTitle') gameTitleElement!: ElementRef;

  readonly SPEED_PX_PER_SEC = 30;
  readonly CYCLE_DURATION_MS = 8000;
  readonly START_DELAY_MS = 1000;

  isMoving = false;
  hasOverflow = false;
  private loopInterval: any;
  private startTimeout: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    window.requestAnimationFrame(() => this.initAnimationLogic());
  }

  ngOnDestroy(): void {
    if (this.loopInterval) clearInterval(this.loopInterval);
    if (this.startTimeout) clearTimeout(this.startTimeout);
  }

  initAnimationLogic(): void {
    if (!this.gameTitleElement) return;

    const spanElement = this.gameTitleElement.nativeElement as HTMLSpanElement;
    const containerElement = spanElement.parentElement as HTMLElement;

    spanElement.style.removeProperty('--scroll-distance');
    spanElement.style.removeProperty('--scroll-duration');

    const overflow = spanElement.scrollWidth - containerElement.clientWidth;

    if (overflow > 0) {
      this.hasOverflow = true;
      const moveDuration = overflow / this.SPEED_PX_PER_SEC;
      spanElement.style.setProperty('--scroll-distance', `-${overflow + 10}px`);
      spanElement.style.setProperty('--scroll-duration', `${moveDuration}s`);

      this.startLoop();
    }
  }

  startLoop(): void {
    const runCycle = () => {
      this.isMoving = false;
      this.cdr.detectChanges();
      this.startTimeout = setTimeout(() => {
        this.isMoving = true;
        this.cdr.detectChanges();
      }, this.START_DELAY_MS);
    };
    runCycle();
    this.loopInterval = setInterval(runCycle, this.CYCLE_DURATION_MS);
  }

  onClick(): void {
    this.cardClick.emit(this.game.id);
  }
}
