import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [HeaderComponent,CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  console.log('Producto:', id);
}
}
