import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OverviewComponent } from './pages/dashboard/overview/overview.component';
import { DiagramsComponent } from './pages/dashboard/diagrams/diagrams.component';
import { QueryEngineComponent } from './pages/dashboard/query-engine/query-engine.component';
import { UploadCodebaseComponent } from './pages/dashboard/upload-codebase/upload-codebase.component';
import { SecurityComponent } from './pages/dashboard/security/security.component';
import { DevOpsComponent } from './pages/dashboard/devops/devops.component';
import { EnterpriseManagementComponent } from './pages/dashboard/enterprise-management/enterprise-management.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'diagrams', component: DiagramsComponent },
      { path: 'query-engine', component: QueryEngineComponent },
      { path: 'upload-codebase', component: UploadCodebaseComponent },
      { path: 'security', component: SecurityComponent },
      { path: 'devops', component: DevOpsComponent },
      { path: 'enterprise-management', component: EnterpriseManagementComponent }
    ]
  },
  { path: '**', redirectTo: '' }
]; 