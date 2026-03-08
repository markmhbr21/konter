import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'supersecretjwtkey_ganti_nanti_di_produksi',
    });
  }

  async validate(payload: any) {
    // payload: { sub: userId, username: string, role: string, branchId: number }
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      branchId: payload.branchId,
    };
  }
}
