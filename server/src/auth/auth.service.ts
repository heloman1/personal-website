import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
@Injectable()
export class AuthService {
  private auth: admin.auth.Auth;
  constructor() {
    this.auth = admin
      .initializeApp({ credential: admin.credential.applicationDefault() })
      .auth();
  }

  async decodeAuthHeader(
    authHeader: string,
  ): Promise<admin.auth.DecodedIdToken> {
    const [bearer, jwtToken] = authHeader.split(' ');
    if (bearer !== 'Bearer') {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.auth.verifyIdToken(jwtToken);
    } catch (err) {
      console.log('Error, verification probably failed');
      console.log(err);
      throw err;
    }
  }
}
