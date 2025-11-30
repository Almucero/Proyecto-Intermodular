import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  platforms = [
    { name: 'PC', image: 'assets/images/platforms/pc.png' },
    { name: 'PS5', image: 'assets/images/platforms/ps5.png' },
    {
      name: 'Xbox Series X',
      image: 'assets/images/platforms/xbox-series-x.png',
    },
    { name: 'Switch', image: 'assets/images/platforms/switch.png' },
    { name: 'PS4', image: 'assets/images/platforms/ps4.png' },
    { name: 'Xbox One', image: 'assets/images/platforms/xbox-one.png' },
  ];
  selectedPlatform: string | null = null;

  product = {
    title: 'Prueba',
    rating: 4.9,
    originalPrice: 59.99,
    price: 30.5,
    description: 'Aquí va la descripción',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: '05/11/19',
    refund: 'Si',
  };

  selectPlatform(platform: string) {
    if (this.selectedPlatform === platform) {
      this.selectedPlatform = null;
    } else {
      this.selectedPlatform = platform;
    }
  }
  currentMediaIndex: number = 0;

  mediaItems = [{ label: 'Imagen' }, { label: 'Video' }];

  previousMedia() {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
    }
  }

  nextMedia() {
    if (this.currentMediaIndex < this.mediaItems.length - 1) {
      this.currentMediaIndex++;
    }
  }

  selectMedia(index: number) {
    this.currentMediaIndex = index;
  }
}
