// src/app/components/report-form/report-form.component.ts
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CameraService } from '../services/camera.service';
import { ReportsService } from '../services/reports.service';
import { Report } from '../app/models/report';

interface PhotoItem {
  url: string;
  timestamp: Date;
}

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, FormsModule],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.css'
})
export class ReportFormComponent implements OnInit {
  cameraService: CameraService = inject(CameraService);
  reportsService: ReportsService = inject(ReportsService);
  router: Router = inject(Router);
  
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  
  reportForm = {
    equipmentId: '',
    description: ''
  };
  
  ngOnInit(): void {
    // Se puede inicializar algo si es necesario
  }
  
  async takePicture() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      try {
        const photoUrl = await this.cameraService.takePicture();
        this.imgUrl = photoUrl;
        
        this.photos.unshift({
          url: photoUrl,
          timestamp: new Date()
        });
      } catch (error) {
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
    
    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      this.imgUrl = '';
    }
  }
  
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
    
    // Una vez guardado, navegamos a la lista de reportes
    this.router.navigate(['/reports']);
  }
  
  canSaveReport(): boolean {
    return !!this.imgUrl && 
           !!this.reportForm.equipmentId.trim() &&
           !!this.reportForm.description.trim();
  }
}