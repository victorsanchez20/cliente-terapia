import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None
})
export class Login {

  dni = '';
  password = '';
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  logear() {
    if (!this.dni.trim() || !this.password.trim()) {
      this.error = 'Ingrese su DNI y contraseña';
      return;
    }

    this.authService.login(this.dni.trim(), this.password).subscribe({
      next: () => {
        this.router.navigate(['/perfil-usuario']);
      },
      error: () => {
        this.error = 'DNI o contraseña inválidos';
      }
    });
  }
}
