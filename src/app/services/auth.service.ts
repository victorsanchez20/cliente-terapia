import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paciente } from '../../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private APIURL = `${environment.api}/api/terapia/paciente`;
  private _patient: Paciente | null = null;

  constructor(private http: HttpClient) {}

  login(dni: string, password: string): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.APIURL}/login`, {
      username: dni,
      password,
    }).pipe(
      tap((patient) => (this._patient = patient))
    );
  }

  getPatient(): Paciente | null {
    return this._patient;
  }

  logout(): void {
    this._patient = null;
  }
}
