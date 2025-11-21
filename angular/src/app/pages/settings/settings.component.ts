import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
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
