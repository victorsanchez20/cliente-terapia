import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Paciente } from '../../models/paciente.model';
import { HistoriaClinicaResponse, HistorialClinicaService } from '../services/historial-clinica.service';
import { ModalHcComponent } from '../components/modal-hc/modal-hc';

export interface StatCard {
  icon: string;
  value: string | number;
  label: string;
  colorClass: string;
  trend?: number;
}

export interface Vital {
  label: string;
  value: string;
  unit: string;
  percent: number;
  status: 'good' | 'warning' | 'danger';
  statusLabel: string;
}

export interface Appointment {
  day: number;
  month: string;
  doctor: string;
  specialty: string;
  time: string;
  location: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  daysLeft: number;
}

export interface HistoryItem {
  id: number;
  title: string;
  doctor: string;
  specialty: string;
  clinic: string;
  date: string;
  statusLabel: string;
  statusClass: string;
  colorClass: string;
  category: string;
}

export interface Notification {
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

export interface HistoryFilter {
  label: string;
  value: string;
}

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

@Component({
  selector: 'app-perfil-usuario',
  imports: [CommonModule, ModalHcComponent],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.scss',
})
export class PerfilUsuario implements OnInit {

  greeting = '';
  lastUpdate = '18 May 2025, 09:42';
  showNotifications = false;
  unreadNotifications = 2;
  activeFilter = 'all';

  historiasClinicas: HistoriaClinicaResponse[] = [];
  hcSeleccionada: HistoriaClinicaResponse | null = null;

  patientData: Paciente | null = null;

  patient = {
    id: '',
    firstName: '',
    lastName: '',
    age: 0,
    bloodType: 'O+',
    phone: '',
    location: '',
    allergies: ['Penicilina'],
    active: true,
    isOnline: true,
  };

  stats: StatCard[] = [
    {
      icon: 'fa-regular fa-file-lines',
      value: 0,
      label: 'Consultas totales',
      colorClass: 'blue',
      trend: 1,
    },
    {
      icon: 'fa-solid fa-pills',
      value: 0,
      label: 'Medicamentos activos',
      colorClass: 'mint',
      trend: 0,
    },
    {
      icon: 'fa-regular fa-calendar-check',
      value: 0,
      label: 'Próxima cita',
      colorClass: 'lav',
    },
  ];




  nextAppointment: Appointment = {
    day: 22,
    month: 'MAY',
    doctor: 'Dr. Ramírez — Cardiología',
    specialty: 'Cardiología',
    time: '10:30 AM',
    location: 'Clínica Central, Lima',
  };

  medications: Medication[] = [
    {
      name: 'Atorvastatina',
      dose: '20 mg',
      frequency: 'Diario · noche',
      daysLeft: 12,
    },
    {
      name: 'Metformina',
      dose: '500 mg',
      frequency: 'Dos veces al día',
      daysLeft: 5,
    },
    {
      name: 'Losartán',
      dose: '50 mg',
      frequency: 'Diario · mañana',
      daysLeft: 20,
    },
  ];

  notifications: Notification[] = [
    {
      message: 'Cita confirmada: Dr. Ramírez 22 May',
      time: 'Hace 1 hora',
      type: 'success',
    },
    {
      message: 'Resultado de laboratorio disponible',
      time: 'Hace 3 horas',
      type: 'info',
    },
    {
      message: 'Medicamento próximo a vencer: 5 días',
      time: 'Ayer, 18:30',
      type: 'warning',
    },
  ];

  historyFilters: HistoryFilter[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Completados', value: 'completed' },
    { label: 'Seguimiento', value: 'followup' },
    { label: 'En revisión', value: 'review' },
  ];

  history: HistoryItem[] = [];


  get filteredHistory(): HistoryItem[] {
    if (this.activeFilter === 'all') return this.history;
    return this.history.filter((h) => h.category === this.activeFilter);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private historiaClinicaService: HistorialClinicaService,
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
      id: 'HC: ' + (patient.hc || '—'),
      firstName: patient.nombre?.split(' ')[0] || '',
      lastName: (patient.apaterno || '') + ' ' + (patient.amaterno || ''),
      age: patient.nacimiento ? getAge(patient.nacimiento) : 0,
      bloodType: 'O+',
      phone: patient.telefono || '—',
      location: patient.direccion || '—',
      allergies: ['Penicilina'],
      active: true,
      isOnline: true,
    };

    if (patient.id) {
      this.cargarHistoriasClinicas(patient.id);
    }
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

  setFilter(value: string): void {
    this.activeFilter = value;
  }

  scheduleAppointment(): void {
    console.log('Navigate to: /citas/nueva');
  }

  editProfile(): void {
    console.log('Navigate to: /perfil/editar');
  }

  reschedule(): void {
    console.log('Reagendar cita:', this.nextAppointment);
  }

  cancelAppointment(): void {
    const confirmed = confirm('¿Seguro que deseas cancelar esta cita?');
    if (confirmed) console.log('Cita cancelada');
  }

  viewAllAppointments(): void {
    console.log('Navigate to: /citas');
  }

  viewHistoryDetail(item: HistoryItem): void {
    console.log('Ver detalle historial:', item.id);
  }

  downloadPDF(): void {
    console.log('Generando PDF del historial médico...');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.icon-btn')) {
      this.showNotifications = false;
    }
  }


  cargarHistoriasClinicas(pacienteId: number) {
    this.historiaClinicaService.obtenerPorPaciente(pacienteId).subscribe({
      next: (data) => {
        this.historiasClinicas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  abrirModal(hc: HistoriaClinicaResponse) {
    this.hcSeleccionada = hc;
  }

  cerrarModal() {
    this.hcSeleccionada = null;
  }
}
