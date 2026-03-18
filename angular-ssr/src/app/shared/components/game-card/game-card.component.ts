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
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { Game } from '../../../core/models/game.model';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Componente de tarjeta para mostrar un juego individual.
 * Incluye lógica de animación para títulos largos (scroll horizontal)
 * y manejo de eventos de clic.
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
})
export class GameCardComponent implements AfterViewInit, OnDestroy {
  /** Objeto del juego a mostrar. */
  @Input() game!: Game;
  /** URL de la imagen de portada. */
  @Input() coverUrl!: string;
  /** Si es true, la tarjeta ocupará todo el ancho disponible. */
  @Input() fullWidth: boolean = false;
  /** Evento emitido al hacer clic en la tarjeta. */
  @Output() cardClick = new EventEmitter<number>();

  /** Referencia al elemento que contiene el título del juego. */
  @ViewChild('gameTitle') gameTitleElement!: ElementRef;

  /** Velocidad del scroll en píxeles por segundo. */
  readonly SPEED_PX_PER_SEC = 30;
  /** Duración total de un ciclo de animación en milisegundos. */
  readonly CYCLE_DURATION_MS = 8000;
  /** Retardo inicial antes de empezar a mover el texto. */
  readonly START_DELAY_MS = 1000;

  /** Indica si el texto está en movimiento actualmente. */
  isMoving = false;
  /** Indica si el título es más largo que el contenedor (requiere scroll). */
  hasOverflow = false;
  private loopInterval: any;
  private startTimeout: any;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Inicializa la lógica de animación si se ejecuta en el navegador.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.requestAnimationFrame(() => this.initAnimationLogic());
    }
  }

  /** Limpia los temporizadores para evitar fugas de memoria. */
  ngOnDestroy(): void {
    if (this.loopInterval) clearInterval(this.loopInterval);
    if (this.startTimeout) clearTimeout(this.startTimeout);
  }

  /**
   * Calcula si el título necesita animación y configura las propiedades CSS dinámicas.
   */
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

  /**
   * Inicia el ciclo infinito de animación del título.
   */
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

  /** Maneja el clic en la tarjeta y emite el ID del juego. */
  onClick(): void {
    this.cardClick.emit(this.game.id);
  }
}
