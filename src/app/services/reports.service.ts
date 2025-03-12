import { Injectable } from '@angular/core';
import { Report } from '../app/models/report';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private reports: Report[] = [];
  private reportsSubject = new BehaviorSubject<Report[]>([]);
  public reports$ = this.reportsSubject.asObservable();

  constructor() {
    // Cargar informes desde localStorage si están disponibles
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      try {
        const parsedReports = JSON.parse(savedReports);
        // Convertir fechas de string a objetos Date
        this.reports = parsedReports.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }));
        this.reportsSubject.next([...this.reports]);
      } catch (error) {
        console.error('Error al analizar informes guardados:', error);
      }
    }
  }

  getAllReports(): Report[] {
    return [...this.reports];
  }

  getReport(id: string): Report | undefined {
    return this.reports.find(report => report.id === id);
  }

  addReport(report: Report): void {
    this.reports.unshift(report);
    this.saveToStorage();
    this.reportsSubject.next([...this.reports]);
  }

  deleteReport(id: string): void {
    this.reports = this.reports.filter(report => report.id !== id);
    this.saveToStorage();
    this.reportsSubject.next([...this.reports]);
  }

  private saveToStorage(): void {
    localStorage.setItem('reports', JSON.stringify(this.reports));
  }

  // Generar un ID único para nuevos informes
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}