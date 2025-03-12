// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'new-report', pathMatch: 'full' },
  { path: 'new-report', component: ReportFormComponent },
  { path: 'reports', component: ReportListComponent },
  { path: 'report/:id', component: ReportDetailComponent },
  { path: '**', redirectTo: 'new-report' }
];