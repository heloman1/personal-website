import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LoginService } from 'src/app/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email = new FormControl('', {
    validators: [Validators.required, Validators.email],
  });
  feedbackMessageCSSClass = 'hidden';
  feedbackMessage = '';

  constructor(private firebase_service: LoginService) {}

  async submit() {
    if (this.email.valid) {
      const email = this.email.value;
      let success = await this.firebase_service.sendSignInEmail(email);
      if (success === true) {
        this.writeMessage(`A signin email has been sent to ${email}`);
      } else {
        this.writeMessage(
          'An error occured when attempting to send the email.'
        );
      }
    }
  }

  getEmailErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }
  writeMessage(msg: string) {
    this.feedbackMessage = msg;
    if (this.feedbackMessage == '') {
      this.feedbackMessageCSSClass = 'hidden';
    } else {
      this.feedbackMessageCSSClass = '';
    }
  }

  ngOnInit(): void {}
}
