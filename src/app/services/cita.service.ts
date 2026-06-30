import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Cita {
  id: number;
  fecha_creacion: string;
  numero_cita: number;
  id_doctor: { id: number; nombre: string; estado: string };
  id_diagnostico: { id: number; nombre: string; descripcion: string } | null;
  id_paciente?: { id: number; nombre: string; apaterno: string; amaterno: string };
  sesiones: any[];
}

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private APIURL = `${environment.api}/api/terapia/cita`;

  constructor(private http: HttpClient) {}

  listarPorPaciente(idPaciente: number) {
    return this.http.get<Cita[]>(`${this.APIURL}/paciente/${idPaciente}`);
  }
}
