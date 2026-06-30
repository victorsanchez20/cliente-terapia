import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Paciente } from '../../models/paciente.model';
import { HistoriaClinicaResponse, HistorialClinicaService } from '../services/historial-clinica.service';
import { ModalHcComponent } from '../components/modal-hc/modal-hc';
import { CitaService, Cita } from '../services/cita.service';
import { SesionService, Sesion } from '../services/sesion.service';
import Swal from 'sweetalert2';

export interface StatCard {
  icon: string;
  value: string | number;
  label: string;
  colorClass: string;
  trend?: number;
}

export interface Notification {
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function estadoLabel(e: number): string {
  switch (e) {
    case 1: return 'Registrada';
    case 2: return 'Completada';
    case 3: return 'Cancelada';
    default: return '—';
  }
}

@Component({
  selector: 'app-perfil-usuario',
  imports: [CommonModule, ModalHcComponent],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.scss',
})
export class PerfilUsuario implements OnInit {

  greeting = '';
  showNotifications = false;
  unreadNotifications = 2;

  historiasClinicas: HistoriaClinicaResponse[] = [];
  hcSeleccionada: HistoriaClinicaResponse | null = null;

  patientData: Paciente | null = null;

  patient = {
    id: '',
    firstName: '',
    lastName: '',
    age: 0,
    phone: '',
    location: '',
    dni: '',
    active: true,
    isOnline: true,
  };

  stats: StatCard[] = [
    {
      icon: 'fa-regular fa-file-lines',
      value: 0,
      label: 'Consultas',
      colorClass: 'blue',
      trend: 0,
    },
    {
      icon: 'fa-regular fa-calendar-check',
      value: '—',
      label: 'Próxima cita',
      colorClass: 'lav',
    },
    {
      icon: 'fa-solid fa-stethoscope',
      value: 0,
      label: 'Diagnósticos',
      colorClass: 'mint',
    },
  ];

  citas: (Cita & { sesiones: Sesion[]; open?: boolean })[] = [];
  tieneCitaRegistrada = false;
  proximaCita: { fecha: string; hora: string; doctor: string; especialidad: string } | null = null;

  notifications: Notification[] = [
    {
      message: 'Bienvenido a tu perfil de salud',
      time: 'Ahora',
      type: 'info',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private historiaClinicaService: HistorialClinicaService,
    private citaService: CitaService,
    private sesionService: SesionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    const patient = this.authService.getPatient();
    if (!patient) {
      this.router.navigate(['/login']);
      return;
    }
    this.patientData = patient;
    this.patient = {
      id: patient.hc || '—',
      firstName: patient.nombre?.split(' ')[0] || '',
      lastName: (patient.apaterno || '') + ' ' + (patient.amaterno || ''),
      age: patient.nacimiento ? getAge(patient.nacimiento) : 0,
      phone: patient.telefono || '—',
      location: patient.direccion || '—',
      dni: patient.dni || '',
      active: true,
      isOnline: true,
    };

    if (patient.id) {
      this.cargarDatos(patient.id);
    }
  }

  cargarDatos(pacienteId: number) {
    this.cargarHistoriasClinicas(pacienteId);
    this.cargarCitas(pacienteId);
  }

  cargarHistoriasClinicas(pacienteId: number) {
    this.historiaClinicaService.obtenerPorPaciente(pacienteId).subscribe({
      next: (data) => {
        this.historiasClinicas = data;
        this.stats[0].value = data.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  cargarCitas(idPaciente: number) {
    this.citaService.listarPorPaciente(idPaciente).subscribe({
      next: (data) => {
        this.citas = data.map(c => ({ ...c, sesiones: [], open: false }));

        this.citas.forEach((cita, i) => {
          this.sesionService.listarPorCita(cita.id).subscribe({
            next: (sesiones) => {
              this.citas[i].sesiones = sesiones;

              if (sesiones.some(s => s.estado === 1)) {
                this.tieneCitaRegistrada = true;
              }

              this.actualizarProximaCita();
              this.cdr.detectChanges();
            },
            error: (err) => console.error(err)
          });
        });

        this.stats[1].value = data.length > 0 ? data.length : '—';
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  actualizarProximaCita() {
    const ahora = new Date();
    let masCercana: { fecha: string; hora: string; doctor: string; especialidad: string } | null = null;

    for (const c of this.citas) {
      for (const s of c.sesiones) {
        const fechaSesion = new Date(s.fecha);
        if (fechaSesion > ahora && s.estado !== 3) {
          if (!masCercana || fechaSesion < new Date(masCercana.fecha)) {
            masCercana = {
              fecha: s.fecha,
              hora: fechaSesion.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
              doctor: c.id_doctor?.nombre || '—',
              especialidad: c.id_diagnostico?.nombre || '—',
            };
          }
        }
      }
    }

    this.proximaCita = masCercana;

    if (masCercana) {
      this.stats[1] = {
        icon: 'fa-regular fa-calendar-check',
        value: new Date(masCercana.fecha).getDate().toString(),
        label: new Date(masCercana.fecha).toLocaleDateString('es-PE', { month: 'short' }),
        colorClass: 'lav',
      };
    }

    this.cdr.detectChanges();
  }

  toggleCita(index: number) {
    this.citas[index].open = !this.citas[index].open;
  }

  abrirModal(hc: HistoriaClinicaResponse) {
    this.hcSeleccionada = hc;
  }

  cerrarModal() {
    this.hcSeleccionada = null;
  }

  sacarCita() {
    if (this.tieneCitaRegistrada) {
      Swal.fire({
        icon: 'warning',
        title: 'Cita activa',
        text: 'Ya tiene una cita registrada. Complete o cancele esa cita antes de solicitar una nueva.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1D6FD1',
      });
      return;
    }

    window.open('https://victorsanchez20.github.io/cliente-citas-terapia/', '_blank');
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Buenos días';
    else if (hour < 18) this.greeting = 'Buenas tardes';
    else this.greeting = 'Buenas noches';
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.unreadNotifications = 0;
  }

  protected readonly estadoLabel = estadoLabel;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.icon-btn')) {
      this.showNotifications = false;
    }
  }
}
