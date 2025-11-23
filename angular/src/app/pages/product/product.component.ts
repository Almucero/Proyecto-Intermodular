import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TranslatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  product = {
    title: 'Prueba',
    rating: 4.9,
    originalPrice: 59.99,
    price: 30.50,
    description: 'Aquí va la descripción',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: '05/11/19',
    refund: 'Si',
    platforms: ['steam', 'epic', 'xbox']
  };
}

