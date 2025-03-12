// src/app/components/report-list/report-list.component.ts
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportsService } from '../services/reports.service';
import { Report } from '../app/models/report';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css'
})
export class ReportListComponent implements OnInit {
  reportsService: ReportsService = inject(ReportsService);
  reports: Report[] = [];
  
  ngOnInit(): void {
    // Suscribirse a los cambios de reportes
    this.reportsService.reports$.subscribe(reports => {
      this.reports = reports;
    });
  }
  
  deleteReport(reportId: string, event: Event) {
    event.preventDefault(); // Prevenir la navegación
    event.stopPropagation(); // Detener la propagación del evento
    
    if (confirm('¿Está seguro que desea eliminar este reporte?')) {
      this.reportsService.deleteReport(reportId);
    }
  }
}