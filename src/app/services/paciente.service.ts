import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Paciente } from '../../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {

   //private APIURL = 'http://localhost:8080/api/terapia/paciente';
  private APIURL = `${environment.api}/api/terapia/paciente`;
  pacientes: Paciente[] = [];
  textoPaciente = '';

  constructor(private http: HttpClient) {}


  buscarPorDNI(dni: string) {
    return this.http.get<Paciente[]>(`${this.APIURL}/${dni}`);
  }

}
