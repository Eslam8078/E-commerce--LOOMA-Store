import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/env';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  name = '';
  email = '';
  message = '';
  sent = false;
  feedback = '';
  readonly supportEmail = environment.supportEmail;

  submit(): void {
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) return;
    if (!this.supportEmail || this.supportEmail.includes('your-domain.com')) {
      this.feedback = 'The store contact email has not been configured yet. Update supportEmail in the environment settings before launch.';
      return;
    }
    const subject = encodeURIComponent(`LOOMA enquiry from ${this.name.trim()}`);
    const body = encodeURIComponent(`${this.message.trim()}\n\nFrom: ${this.name.trim()}\nEmail: ${this.email.trim()}`);
    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
    this.sent = true;
    this.feedback = 'Your email app has been opened with your message.';
  }
}
