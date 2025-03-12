// src/app/components/report-detail/report-detail.component.ts
import { NgIf, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportsService } from '../services/reports.service';
import { Report } from '../app/models/report';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent implements OnInit {
  reportsService: ReportsService = inject(ReportsService);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  
  report: Report | undefined;
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.report = this.reportsService.getReport(id);
        if (!this.report) {
          // Si no existe el reporte, redireccionar a la lista
          this.router.navigate(['/reports']);
        }
      }
    });
  }
  
  deleteReport() {
    if (this.report && confirm('¿Está seguro que desea eliminar este reporte?')) {
      this.reportsService.deleteReport(this.report.id);
      this.router.navigate(['/reports']);
    }
  }
}