import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,RouterModule,HeaderComponent,TranslatePipe
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  genres = [
  'genre_action', 'genre_adventure', 'genre_rpg', 'genre_sports',
  'genre_strategy', 'genre_simulation', 'genre_horror', 'genre_racing'
];

   featuredImages = [
    { id: 1, url: 'https://via.placeholder.com/300x200?text=Imagen+1' },
    { id: 2, url: 'https://via.placeholder.com/300x200?text=Imagen+2' },
    { id: 3, url: 'https://via.placeholder.com/300x200?text=Imagen+3' },
    { id: 4, url: 'https://via.placeholder.com/300x200?text=Imagen+4' },
    { id: 5, url: 'https://via.placeholder.com/300x200?text=Imagen+5' },
  ];
  ngOnInit(): void {}
  constructor(private http: HttpClient,private router: Router) {}

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





