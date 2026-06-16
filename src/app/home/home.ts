import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── INTERFACES ─────────────────────────────────────────────────────────────

export interface NavLink     { label: string; href: string; }
export interface GlobalStat  { value: string; label: string; }
export interface Specialty   { name: string; desc: string; icon: string; colorClass: string; doctors: number; hovered?: boolean; }
export interface Step        { title: string; desc: string; icon: string; colorClass: string; }
export interface Doctor      { name: string; initials: string; specialty: string; rating: number; experience: number; available: boolean; bg: string; }
export interface Testimonial { name: string; initials: string; quote: string; rating: number; specialty: string; bg: string; featured?: boolean; }
export interface Tip         { title: string; excerpt: string; tag: string; author: string; readTime: number; }
export interface FooterCol   { title: string; links: { label: string; href: string }[]; }

// ── COMPONENT ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit, OnDestroy {

  // ── Navbar ─────────────────────────────────────────────────────────────
  isScrolled  = false;
  menuOpen    = false;

  navLinks: NavLink[] = [
    { label: 'Inicio',          href: '#inicio'         },
    { label: 'Especialidades',  href: '#especialidades' },
    { label: 'Cómo funciona',   href: '#como-funciona'  },
    { label: 'Doctores',        href: '#doctores'       },
    { label: 'Servicios',       href: '#servicios'      },
    { label: 'Blog',            href: '#blog'           },
  ];

  // ── Hero ───────────────────────────────────────────────────────────────
  searchQuery      = '';
  selectedDistrict = '';

  districts = [
    'Miraflores', 'San Isidro', 'Surco', 'La Molina',
    'Jesús María', 'San Borja', 'Barranco', 'Lince',
  ];

  popularTags = ['Cardiología', 'Pediatría', 'Dermatología', 'Psicología', 'Neurología'];

  // ── Stats bar ──────────────────────────────────────────────────────────
  globalStats: GlobalStat[] = [
    { value: '1M+',    label: 'Pacientes atendidos'    },
    { value: '100+',   label: 'Especialistas activos'  },
    { value: '20+',    label: 'Especialidades médicas' },
    { value: '4.9★',   label: 'Satisfacción promedio'  },
  ];

  // ── Specialties ────────────────────────────────────────────────────────
  specialties: Specialty[] = [
    { name: 'Cardiología',      desc: 'Corazón y sistema cardiovascular.',        icon: 'fa-solid fa-heart-pulse',       colorClass: 'peach',  doctors: 12 },
    { name: 'Pediatría',        desc: 'Atención especializada para niños.',        icon: 'fa-solid fa-baby',              colorClass: 'mint',   doctors: 9  },
    { name: 'Neurología',       desc: 'Sistema nervioso y cerebro.',               icon: 'fa-solid fa-brain',             colorClass: 'lav',    doctors: 7  },
    { name: 'Dermatología',     desc: 'Piel, cabello y uñas.',                    icon: 'fa-solid fa-hand-dots',         colorClass: 'yellow', doctors: 8  },
    { name: 'Traumatología',    desc: 'Huesos, músculos y articulaciones.',        icon: 'fa-solid fa-bone',              colorClass: 'blue',   doctors: 10 },
    { name: 'Psicología',       desc: 'Salud mental y bienestar emocional.',       icon: 'fa-solid fa-brain',             colorClass: 'lav',    doctors: 11 },
    { name: 'Ginecología',      desc: 'Salud femenina integral.',                  icon: 'fa-solid fa-venus',             colorClass: 'peach',  doctors: 9  },
    { name: 'Oftalmología',     desc: 'Ojos y visión.',                           icon: 'fa-solid fa-eye',               colorClass: 'mint',   doctors: 6  },
    { name: 'Endocrinología',   desc: 'Hormonas y metabolismo.',                  icon: 'fa-solid fa-dna',               colorClass: 'yellow', doctors: 5  },
    { name: 'Neumología',       desc: 'Pulmones y sistema respiratorio.',          icon: 'fa-solid fa-lungs',             colorClass: 'blue',   doctors: 6  },
    { name: 'Gastroenterología',desc: 'Aparato digestivo.',                        icon: 'fa-solid fa-stethoscope',       colorClass: 'mint',   doctors: 8  },
    { name: 'Medicina General', desc: 'Tu médico de cabecera para todo.',          icon: 'fa-solid fa-user-doctor',       colorClass: 'blue',   doctors: 14 },
  ];

  get totalSpecialties(): number { return 20; }

  // ── Steps ──────────────────────────────────────────────────────────────
  steps: Step[] = [
    {
      title: 'Crea tu cuenta',
      desc:  'Regístrate gratis en menos de 2 minutos. Sin tarjeta de crédito.',
      icon:  'fa-regular fa-user',
      colorClass: 'blue',
    },
    {
      title: 'Elige tu especialidad',
      desc:  'Más de 20 especialidades y 100 médicos disponibles.',
      icon:  'fa-solid fa-stethoscope',
      colorClass: 'mint',
    },
    {
      title: 'Reserva tu cita',
      desc:  'Selecciona el día, hora y modalidad: presencial o videoconsulta.',
      icon:  'fa-regular fa-calendar-check',
      colorClass: 'lav',
    },
    {
      title: 'Recibe atención',
      desc:  'Consulta con tu médico y accede a tu historial y recetas en línea.',
      icon:  'fa-solid fa-circle-check',
      colorClass: 'peach',
    },
  ];

  // ── Doctors ────────────────────────────────────────────────────────────
  doctors: Doctor[] = [
    { name: 'Dr. Carlos Ramírez', initials: 'CR', specialty: 'Cardiología',   rating: 4.9, experience: 15, available: true,  bg: '#1D6FD1' },
    { name: 'Dra. Laura Torres',  initials: 'LT', specialty: 'Neurología',    rating: 4.8, experience: 12, available: true,  bg: '#5B47B8' },
    { name: 'Dr. José Medina',    initials: 'JM', specialty: 'Pediatría',     rating: 4.9, experience: 10, available: false, bg: '#0A7265' },
    { name: 'Dra. Ana Rojas',     initials: 'AR', specialty: 'Dermatología',  rating: 4.7, experience: 8,  available: true,  bg: '#C2440E' },
  ];

  // ── Testimonials ───────────────────────────────────────────────────────
  testimonials: Testimonial[] = [
    {
      name:      'Sofía Mendoza',
      initials:  'SM',
      quote:     'Encontré al mejor cardiólogo en menos de 5 minutos. La videoconsulta fue increíblemente cómoda y profesional.',
      rating:    5,
      specialty: 'Paciente de Cardiología',
      bg:        '#1D6FD1',
      featured:  true,
    },
    {
      name:      'Roberto Chávez',
      initials:  'RC',
      quote:     'Mi hijo tiene seguimiento pediátrico cada mes y el historial digital nos ahorra mucho tiempo en cada visita.',
      rating:    5,
      specialty: 'Padre de paciente · Pediatría',
      bg:        '#0A7265',
    },
    {
      name:      'Patricia Lima',
      initials:  'PL',
      quote:     'Las recetas digitales y la entrega de medicamentos a domicilio son un servicio que no encontré en ningún otro centro.',
      rating:    5,
      specialty: 'Paciente de Endocrinología',
      bg:        '#5B47B8',
    },
  ];

  // ── Blog tips ──────────────────────────────────────────────────────────
  tips: Tip[] = [
    {
      title:    '5 hábitos que protegen tu corazón a cualquier edad',
      excerpt:  'Pequeños cambios diarios que marcan una gran diferencia en tu salud cardiovascular a largo plazo.',
      tag:      'Corazón',
      author:   'Dr. Ramírez',
      readTime: 4,
    },
    {
      title:    'Cómo prepararte para una videoconsulta médica',
      excerpt:  'Guía práctica para aprovechar al máximo tu consulta en línea.',
      tag:      'Consejos',
      author:   'Equipo E-sheba',
      readTime: 3,
    },
    {
      title:    'Señales de alerta que nunca debes ignorar',
      excerpt:  'Síntomas que requieren atención médica inmediata y cuándo ir a urgencias.',
      tag:      'Urgencias',
      author:   'Dra. Torres',
      readTime: 5,
    },
  ];

  // ── Footer ─────────────────────────────────────────────────────────────
  footerColumns: FooterCol[] = [
    {
      title: 'Servicios',
      links: [
        { label: 'Videoconsulta',      href: '/videoconsulta' },
        { label: 'Laboratorio',        href: '/laboratorio'   },
        { label: 'Farmacia',           href: '/farmacia'      },
        { label: 'Radiología',         href: '/radiologia'    },
        { label: 'Urgencias',          href: '/urgencias'     },
      ],
    },
    {
      title: 'Especialidades',
      links: [
        { label: 'Cardiología',        href: '#' },
        { label: 'Pediatría',          href: '#' },
        { label: 'Neurología',         href: '#' },
        { label: 'Psicología',         href: '#' },
        { label: 'Ver todas',          href: '/especialidades' },
      ],
    },
    {
      title: 'E-sheba',
      links: [
        { label: 'Sobre nosotros',     href: '/nosotros'  },
        { label: 'Trabaja con nosotros', href: '/empleo'  },
        { label: 'Prensa',             href: '/prensa'    },
        { label: 'Blog de salud',      href: '/blog'      },
        { label: 'Contacto',           href: '/contacto'  },
      ],
    },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {}
  ngOnDestroy(): void {}

  // ── Scroll listener ────────────────────────────────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  // ── Click outside to close menu ────────────────────────────────────────
  onPageClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.burger') && !target.closest('.mobile-menu')) {
      this.menuOpen = false;
    }
  }

  // ── Navbar ─────────────────────────────────────────────────────────────
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  scrollTo(event: Event, href: string): void {
    event.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuOpen = false;
  }

  // ── Hero search ────────────────────────────────────────────────────────
  onSearch(): void {
    // Could emit to a search service or filter results
    console.log('Searching:', this.searchQuery, '| District:', this.selectedDistrict);
  }

  doSearch(): void {
    console.log('Go to results:', this.searchQuery, this.selectedDistrict);
    // this.router.navigate(['/buscar'], { queryParams: { q: this.searchQuery, distrito: this.selectedDistrict } });
  }

  selectTag(tag: string): void {
    this.searchQuery = tag;
    this.doSearch();
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
