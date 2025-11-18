import { Routes } from '@angular/router';
import { authGuard, customerGuard, vendorGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'registration',
    loadComponent: () => import('./pages/registration/registration.component').then(m => m.RegistrationComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'create-rfq',
    loadComponent: () => import('./pages/create-rfq/create-rfq.component').then(m => m.CreateRfqComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'rfq-list',
    loadComponent: () => import('./pages/rfq-list/rfq-list.component').then(m => m.RfqListComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'open-rfq',
    loadComponent: () => import('./pages/open-rfq/open-rfq.component').then(m => m.OpenRfqComponent),
    canActivate: [vendorGuard]
  },
  {
    path: 'rfqs/:id',
    loadComponent: () => import('./pages/rfqs/rfqs.component').then(m => m.RfqsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bids',
    loadComponent: () => import('./pages/my-bids/my-bids.component').then(m => m.MyBidsComponent),
    canActivate: [vendorGuard]
  },
  // IMPORTANT: Changed from query param to path param for rfqId
  {
    path: 'compare-quotes/:rfqId',
    loadComponent: () => import('./pages/compare-quotes/compare-quotes.component').then(m => m.CompareQuotesComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'create-contract',
    loadComponent: () => import('./pages/create-contract/create-contract.component').then(m => m.CreateContractComponent),
    canActivate: [customerGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];