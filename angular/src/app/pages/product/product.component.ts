import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [],
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
