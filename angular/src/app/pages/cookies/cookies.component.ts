import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies',
  imports: [RouterModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss'
})
export class CookiesComponent {
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
