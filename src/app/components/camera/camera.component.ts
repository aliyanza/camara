import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CameraService } from '../../services/camera.service';
import { ReportsService } from '../../services/reports.service';

export interface Report {
  id: string;
imageUrl: string;
equipmentId: string;
description: string;
timestamp: Date;
}


interface PhotoItem {
  url: string;
  timestamp: Date;
}

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, FormsModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {
  cameraService: CameraService = inject(CameraService);
  reportsService: ReportsService = inject(ReportsService);
  
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  
  // Propiedades relacionadas con los reportes
  reports: Report[] = [];
  selectedReport: Report | null = null;
  reportForm = {
    equipmentId: '',
    description: ''
  };
  
  ngOnInit(): void {
    // Suscribirse a los cambios de reportes
    this.reportsService.reports$.subscribe(reports => {
      this.reports = reports;
    });
  }
  
  async takePicture() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      // Manejamos posibles errores de la web de manera más detallada
      try {
        const photoUrl = await this.cameraService.takePicture();
        // Mostramos la foto recién tomada
        this.imgUrl = photoUrl;
        
        // Añadimos la foto a la galería
        this.photos.unshift({
          url: photoUrl,
          timestamp: new Date()
        });
      } catch (error) {
        // Verificamos si el error es específico del entorno web
        if (String(error).includes('Not implemented on web')) {
          throw new Error('Esta función no está disponible en navegadores web. Por favor, usa la aplicación móvil.');
        } else {
          throw error;
        }
      }
      
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      
      this.loading = false;
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      this.errorMessage = String(error);
      this.loading = false;
    }
  }
  
  // Método para establecer una foto como la foto principal
  setMainPhoto(photo: PhotoItem) {
    this.imgUrl = photo.url;
    // Limpiar campos del formulario al cambiar la foto
    this.reportForm = {
      equipmentId: '',
      description: ''
    };
  }
  
  // Método para eliminar una foto de la galería
  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    
    // Si borramos la foto que estaba visualizándose y hay otras fotos,
    // mostramos la primera de la galería
    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      // Si no quedan fotos, limpiamos la foto principal
      this.imgUrl = '';
    }
  }
  
  // Métodos relacionados con reportes
  saveReport() {
    if (!this.canSaveReport()) {
      this.errorMessage = 'Por favor complete todos los campos del reporte';
      return;
    }
    
    const newReport: Report = {
      id: this.reportsService.generateId(),
      imageUrl: this.imgUrl,
      equipmentId: this.reportForm.equipmentId,
      description: this.reportForm.description,
      timestamp: new Date()
    };
    
    this.reportsService.addReport(newReport);
    
    // Limpiar formulario después de guardar
    this.reportForm = {
      equipmentId: '',
      description: ''
    };
    
    // Opcional: Mostrar mensaje de éxito
    this.errorMessage = '';
    alert('Reporte guardado con éxito');
  }
  
  canSaveReport(): boolean {
    return !!this.imgUrl && 
           !!this.reportForm.equipmentId.trim() &&
           !!this.reportForm.description.trim();
  }
  
  viewReport(report: Report) {
    this.selectedReport = report;
  }
  
  closeReportView(event: Event) {
    this.selectedReport = null;
  }
  
  deleteReport(reportId: string) {
    if (confirm('¿Está seguro que desea eliminar este reporte?')) {
      this.reportsService.deleteReport(reportId);
      if (this.selectedReport?.id === reportId) {
        this.selectedReport = null;
      }
    }
  }
}