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

/**
 * Componente de carrusel para mostrar una lista de juegos de forma horizontal.
 * Permite la navegación mediante flechas y arrastre (drag) con el ratón.
 */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TranslatePipe, GameCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements AfterViewInit {
  /** Título de la sección del carrusel. */
  @Input() title: string = '';
  /** Lista de juegos a mostrar. */
  @Input() items: Game[] = [];
  /** ID único de la sección para propósitos de accesibilidad o anclaje. */
  @Input() sectionId: string = '';
  /** Evento emitido al hacer clic en un juego (emite el ID del juego). */
  @Output() itemClick = new EventEmitter<number>();

  /** Referencia al contenedor que tiene el scroll. */
  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLElement>;

  /** Estado de visibilidad de las flechas de navegación. */
  arrowState = { left: false, right: true };
  /** Indica si el usuario está arrastrando el carrusel. */
  isDragging = false;
  /** Posición X inicial del ratón al empezar el arrastre. */
  startX = 0;
  /** Posición de scroll inicial al empezar el arrastre. */
  scrollLeftPos = 0;

  constructor() {}

  /**
   * Inicializa el estado del scroll tras la carga de la vista.
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollState(), 0);
  }

  /**
   * Obtiene la URL de la carátula de un juego.
   * Busca el medio que contenga 'cover' en su nombre original, o usa el primero de la lista.
   * @param game Objeto del juego.
   * @returns URL de la imagen.
   */
  getCoverUrl(game: Game): string {
    if (!game.media || game.media.length === 0) {
      return 'assets/images/placeholder.png';
    }
    const cover = game.media.find((m) =>
      m.originalName?.toLowerCase().includes('cover'),
    );
    return cover ? cover.url : game.media[0].url;
  }

  /**
   * Maneja el clic en un artículo del carrusel.
   * Evita el clic si se estaba realizando un arrastre.
   * @param id ID del juego.
   */
  onItemClick(id: number): void {
    if (!this.isDragging) {
      this.itemClick.emit(id);
    }
  }

  /**
   * Desplaza el carrusel hacia la izquierda.
   */
  scrollLeft(): void {
    const carousel = this.carouselContainer.nativeElement;
    carousel.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 350);
  }

  /**
   * Desplaza el carrusel hacia la derecha.
   */
  scrollRight(): void {
    const carousel = this.carouselContainer.nativeElement;
    carousel.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 350);
  }

  /**
   * Actualiza el estado de las flechas de navegación según la posición actual del scroll.
   */
  updateScrollState(): void {
    const carousel = this.carouselContainer.nativeElement;
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    this.arrowState = {
      left: scrollLeft > 1,
      right: scrollLeft < maxScrollLeft - 1,
    };
  }

  /**
   * Inicia el seguimiento del arrastre con el ratón.
   */
  onMouseDown(e: MouseEvent): void {
    const carousel = this.carouselContainer.nativeElement;
    this.isDragging = false;
    this.startX = e.pageX - carousel.offsetLeft;
    this.scrollLeftPos = carousel.scrollLeft;
  }

  /** Cancela el estado de arrastre si el ratón sale del contenedor. */
  onMouseLeave(): void {
    this.isDragging = false;
  }

  /** Finaliza el arrastre tras un breve retardo para evitar clics accidentales. */
  onMouseUp(): void {
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  /**
   * Realiza el desplazamiento del carrusel siguiendo el movimiento del ratón.
   */
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
