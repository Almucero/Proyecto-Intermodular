import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { GenresComponent } from './pages/genres/genres.component';
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
    data: { animation: 'HomePage' },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { animation: 'RegisterPage' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, customerGuard],
    data: { animation: 'DashboardPage' },
  },
  {
    path: 'product/:id',
    component: ProductComponent,
    data: { animation: 'ProductPage' },
  },
  {
    path: 'genres/:nombre',
    component: GenresComponent,
    data: { animation: 'GenresPage' },
  },
  {
    path: 'aichat',
    component: AIChatComponent,
    data: { animation: 'AIChatPage' },
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
    data: { animation: 'FavouritesPage' },
  },
  {
    path: 'cart',
    component: CartComponent,
    data: { animation: 'CartPage' },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { animation: 'SettingsPage' },
  },
  {
    path: 'help',
    component: HelpComponent,
    data: { animation: 'HelpPage' },
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: { animation: 'ContactPage' },
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    data: { animation: 'PrivacyPage' },
  },
  {
    path: 'conditions',
    component: ConditionsComponent,
    data: { animation: 'ConditionsPage' },
  },
  {
    path: 'cookies',
    component: CookiesComponent,
    data: { animation: 'CookiesPage' },
  },
  {
    path: 'search',
    component: SearchComponent,
    data: { animation: 'SearchPage' },
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
    data: { animation: 'AdminPage' },
  },
];
