import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ProductComponent } from './pages/product/product.component';
import { GenresComponent } from './pages/genres/genres.component';
import { AIChatComponent } from './pages/aichat/aichat.component';
import { FavouritesComponent } from './pages/favourites/favourites.component';
import { CartComponent } from './pages/cart/cart.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ConditionsComponent } from './pages/conditions/conditions.component';
import { CookiesComponent } from './pages/cookies/cookies.component';


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
    canActivate: [authGuard],
  },
  { path: 'product/:id',
    component: ProductComponent 
  },
  { path: 'genres/:nombre',
    component: GenresComponent 
  },
  { path: 'aichat',
    component: AIChatComponent 
  },
  { path: 'favourites',
    component: FavouritesComponent 
  },
  { path: 'cart',
    component: CartComponent 
  },
  { path: 'settings',
    component: SettingsComponent 
  },
  { path: 'help',
    component: HelpComponent 
  },
  { path: 'contact',
    component: ContactComponent 
  },
  { path: 'privacy',
    component: PrivacyComponent 
  },
  { path: 'conditions',
    component: ConditionsComponent 
  },
  { path: 'cookies',
    component: CookiesComponent 
  },
];
