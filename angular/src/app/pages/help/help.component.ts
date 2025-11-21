import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  imports: [RouterModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
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
