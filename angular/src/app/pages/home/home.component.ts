import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeaderComponent, TranslatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  genres = [
    'genres.action',
    'genres.adventure',
    'genres.rpg',
    'genres.sports',
    'genres.strategy',
    'genres.simulation',
    'genres.horror',
    'genres.racing',
  ];

  featuredImages = [
    {
      id: 1,
      url: 'https://via.placeholder.com/300x200?text=Zelda',
      title: 'The Legend of Zelda',
    },
    {
      id: 2,
      url: 'https://via.placeholder.com/300x200?text=God+of+War',
      title: 'God of War',
    },
    {
      id: 3,
      url: 'https://via.placeholder.com/300x200?text=Elden+Ring',
      title: 'Elden Ring',
    },
    {
      id: 4,
      url: 'https://via.placeholder.com/300x200?text=Cyberpunk',
      title: 'Cyberpunk 2077',
    },
    {
      id: 5,
      url: 'https://via.placeholder.com/300x200?text=Hollow+Knight',
      title: 'Hollow Knight',
    },
    {
      id: 6,
      url: 'https://via.placeholder.com/300x200?text=Minecraft',
      title: 'Minecraft',
    },
    {
      id: 7,
      url: 'https://via.placeholder.com/300x200?text=Fortnite',
      title: 'Fortnite',
    },
    {
      id: 8,
      url: 'https://via.placeholder.com/300x200?text=Overwatch',
      title: 'Overwatch 2',
    },
    {
      id: 9,
      url: 'https://via.placeholder.com/300x200?text=GTA+V',
      title: 'Grand Theft Auto V',
    },
    {
      id: 10,
      url: 'https://via.placeholder.com/300x200?text=RDR2',
      title: 'Red Dead Redemption 2',
    },
    {
      id: 11,
      url: 'https://via.placeholder.com/300x200?text=FIFA+23',
      title: 'FIFA 23',
    },
    {
      id: 12,
      url: 'https://via.placeholder.com/300x200?text=Call+of+Duty',
      title: 'Call of Duty: MWII',
    },
    {
      id: 13,
      url: 'https://via.placeholder.com/300x200?text=Among+Us',
      title: 'Among Us',
    },
    {
      id: 14,
      url: 'https://via.placeholder.com/300x200?text=Stardew+Valley',
      title: 'Stardew Valley',
    },
    {
      id: 15,
      url: 'https://via.placeholder.com/300x200?text=Terraria',
      title: 'Terraria',
    },
    {
      id: 16,
      url: 'https://via.placeholder.com/300x200?text=Rocket+League',
      title: 'Rocket League',
    },
    {
      id: 17,
      url: 'https://via.placeholder.com/300x200?text=Valorant',
      title: 'Valorant',
    },
    {
      id: 18,
      url: 'https://via.placeholder.com/300x200?text=LoL',
      title: 'League of Legends',
    },
  ];

  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

  arrowState: { [key: string]: { left: boolean; right: boolean } } = {
    masVendidos: { left: false, right: true },
    ofertas: { left: false, right: true },
    mejorValorados: { left: false, right: true },
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit() {}

  scrollLeft(carousel: HTMLElement, section: string) {
    carousel.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(carousel, section), 350);
  }

  scrollRight(carousel: HTMLElement, section: string) {
    carousel.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(carousel, section), 350);
  }

  updateScrollState(carousel: HTMLElement, section: string) {
    const scrollLeft = carousel.scrollLeft;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    const isAtStart = scrollLeft <= 1;
    const isAtEnd = scrollLeft >= maxScrollLeft - 1;

    this.arrowState[section] = {
      left: !isAtStart,
      right: !isAtEnd,
    };
  }

  goToProduct(id: number) {
    if (!this.isDragging) {
      this.router.navigate(['/product', id]);
    }
  }

  goToGenres(nombre: string) {
    this.router.navigate(['/genres', nombre.toLowerCase()]);
  }

  onMouseDown(e: MouseEvent, carousel: HTMLElement) {
    this.isDragging = false;
    this.startX = e.pageX - carousel.offsetLeft;
    this.scrollLeftPos = carousel.scrollLeft;
    carousel.classList.add('active');
  }

  onMouseLeave(carousel: HTMLElement) {
    this.isDragging = false;
    carousel.classList.remove('active');
  }

  onMouseUp(carousel: HTMLElement) {
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
    carousel.classList.remove('active');
  }

  onMouseMove(e: MouseEvent, carousel: HTMLElement) {
    if (e.buttons !== 1) return;
    if (e.buttons !== 1) return;

    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - this.startX) * 2;
    carousel.scrollLeft = this.scrollLeftPos - walk;

    if (Math.abs(walk) > 5) {
      this.isDragging = true;
    }
  }
}
