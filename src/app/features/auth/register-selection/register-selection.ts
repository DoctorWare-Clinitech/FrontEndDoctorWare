// src/app/features/auth/register-selection/register-selection.ts

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-selection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register-selection.html',
  styleUrls: ['./register-selection.scss']
})
export class RegisterSelection {
  constructor(private router: Router) {}

  /**
   * Navegar a la página de registro según el rol seleccionado
   */
  selectRole(role: 'patient' | 'professional'): void {
    this.router.navigate([`/auth/register/${role}`]);
  }
}
