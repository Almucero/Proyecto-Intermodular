import { Component, OnInit,ViewChild,HostListener,ElementRef  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,RouterModule
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  genres = ['Acción','Aventura','RPG','Deportes','Estrategia','Simulación','Terror','Carreras'];

   featuredImages = [
    { id: 1, url: 'https://via.placeholder.com/300x200?text=Imagen+1' },
    { id: 2, url: 'https://via.placeholder.com/300x200?text=Imagen+2' },
    { id: 3, url: 'https://via.placeholder.com/300x200?text=Imagen+3' },
    { id: 4, url: 'https://via.placeholder.com/300x200?text=Imagen+4' },
    { id: 5, url: 'https://via.placeholder.com/300x200?text=Imagen+5' },
  ];

  isMenuOpen = false;
   @ViewChild('menu') menu!: ElementRef;

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
   @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isMenuOpen && this.menu && !this.menu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  scrollLeft(carousel: HTMLElement) {
  carousel.scrollBy({ left: -300, behavior: 'smooth' });
}

scrollRight(carousel: HTMLElement) {
  carousel.scrollBy({ left: 300, behavior: 'smooth' });
}
goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }
  goToGenres(nombre: string) {
  this.router.navigate(['/genres', nombre.toLowerCase()]);
}
}





