import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Sesion {
  id: number;
  numero_sesion: number;
  fecha: string;
  estado: number;
  id_cita?: { id: number };
}

@Injectable({
  providedIn: 'root',
})
export class SesionService {
  private api = `${environment.api}/api/terapia/sesion`;

  constructor(private http: HttpClient) {}

  listarPorCita(idCita: number) {
    return this.http.get<Sesion[]>(`${this.api}/cita/${idCita}`);
  }

  listarPorPaciente(idPaciente: number) {
    return this.http.get<Sesion[]>(`${this.api}/paciente/${idPaciente}`);
  }
}
