import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { ConfigService } from 'src/config/config.service';
@Injectable()
export class AuthService {
  private auth: admin.auth.Auth;
  constructor(private readonly config: ConfigService) {
    this.auth = admin
      .initializeApp({
        credential: admin.credential.cert(config.googleCredLoc),
      })
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
