import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import admin from 'firebase-admin';
import { ConfigService } from 'src/config/config.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return this.validateRequest(request);
  }

  private async validateRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await this.authService.decodeAuthHeader(authHeader);
    } catch (err) {
      console.error('Error in servers-status, token decoding failed');
      console.error(err);
      return false;
    }
    const email = decodedToken.email;
    if (!email) {
      return false;
    }
    if (this.config.emails[email]) {
      req.headers.set('email', email);
      return true;
    } else {
      throw new HttpException( // Unsure if this exception should be here
        'This email is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
