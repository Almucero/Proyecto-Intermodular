import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  categories = ['Acción','Aventura','RPG','Deportes','Estrategia','Simulación','Terror','Carreras'];

  featuredImages: string[] = [
    'https://via.placeholder.com/300x200?text=Imagen+1',
    'https://via.placeholder.com/300x200?text=Imagen+2',
    'https://via.placeholder.com/300x200?text=Imagen+3',
    'https://via.placeholder.com/300x200?text=Imagen+4',
    'https://via.placeholder.com/300x200?text=Imagen+5',
  ];

  isMenuOpen = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}





