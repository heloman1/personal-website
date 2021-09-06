import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    email = new FormControl('', {
        validators: [Validators.required, Validators.email],
    });
    fadeIn = false;
    feedbackMessage = '';
    disableSend = false;
    constructor(
        private firebase_service: LoginService,
        private router: Router
    ) {}

    ngOnInit() {
        this.firebase_service.tryCompleteSignIn(window.location.href).then(async (success) => {
            if (success) {
                this.router.navigateByUrl('/servers'); // "Redirect" away from sign-in url
            }
        });
    }
    emailInputMessage() {
        if (this.email.hasError('required')) {
            return 'You must enter a value';
        }
        return this.email.hasError('email') ? 'Not a valid email' : '';
    }

    async submit() {
        if (this.email.valid) {
            this.disableSend = true;
            const email = this.email.value;
            let success = await this.firebase_service.sendSignInEmail(email);
            if (success === true) {
                this.feedbackMessage = `A signin email has been sent to ${email}.\nMake sure to check your junk mail.`;
            } else {
                this.feedbackMessage =
                    'An error occurred when attempting to send the email.';
                this.disableSend = false;
            }
            this.fadeIn = true;
        }
    }
}
