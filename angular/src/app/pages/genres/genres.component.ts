import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-genres',
  imports: [RouterModule],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss'
})
export class GenresComponent {
genresName = '';

  constructor(private route: ActivatedRoute) {
    this.genresName = this.route.snapshot.paramMap.get('nombre')!;
  }

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
