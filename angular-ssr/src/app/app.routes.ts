/**
 * Definición de las rutas principales de la aplicación.
 * Asocia componentes a rutas URL y define guardias de seguridad y animaciones de transición.
 */
import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';

import { AIChatComponent } from './pages/aichat/aichat.component';
import { FavouritesComponent } from './pages/favourites/favourites.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ConditionsComponent } from './pages/conditions/conditions.component';
import { CookiesComponent } from './pages/cookies/cookies.component';
import { ProductComponent } from './pages/product/product.component';
import { CartComponent } from './pages/cart/cart.component';
import { AdminComponent } from './pages/admin/admin.component';
import { SearchComponent } from './pages/search/search.component';

import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, customerGuard],
  },
  {
    path: 'product/:id',
    component: ProductComponent,
  },

  {
    path: 'aichat',
    component: AIChatComponent,
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'help',
    component: HelpComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'conditions',
    component: ConditionsComponent,
  },
  {
    path: 'cookies',
    component: CookiesComponent,
  },
  {
    path: 'search',
    component: SearchComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'genres', pathMatch: 'full' },
      {
        path: 'genres',
        loadComponent: () =>
          import('./pages/admin/genres/genre-list/genre-list.component').then(
            (m) => m.GenreListComponent,
          ),
      },
      {
        path: 'developers',
        loadComponent: () =>
          import('./pages/admin/developers/developer-list/developer-list.component').then(
            (m) => m.DeveloperListComponent,
          ),
      },
      {
        path: 'platforms',
        loadComponent: () =>
          import('./pages/admin/platforms/platform-list/platform-list.component').then(
            (m) => m.PlatformListComponent,
          ),
      },
      {
        path: 'publishers',
        loadComponent: () =>
          import('./pages/admin/publishers/publisher-list/publisher-list.component').then(
            (m) => m.PublisherListComponent,
          ),
      },
      {
        path: 'games',
        loadComponent: () =>
          import('./pages/admin/games/game-list/game-list.component').then(
            (m) => m.GameListComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
