import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  isMenuOpen = false;
  @ViewChild('menu') menu!: ElementRef;
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
}
