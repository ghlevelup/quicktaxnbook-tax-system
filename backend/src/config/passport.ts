import { ExtractJwt, Strategy as JwtStrategy, VerifyCallback } from 'passport-jwt';

import prisma from '@/client';
import { AuthActor } from '@/types/response';
import { AccessTokenPayload } from '@/shared/services/token.service';
import config from './config';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload: AccessTokenPayload, done) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return done(null, false);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountRole: true,
        status: true,
        memberships: {
          where: { firmId: payload.firmId ?? undefined },
          select: { id: true, firmId: true, isOwner: true, status: true },
          take: 1,
        },
        clientAccess: {
          select: { clientId: true, revokedAt: true },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return done(null, false);
    }

    const membership = user.memberships[0];
    if ((user.accountRole === 'FIRM_ADMIN' || user.accountRole === 'FIRM_TEAM') && membership) {
      if (membership.status !== 'ACTIVE') {
        return done(null, false);
      }
    }

    const actor: AuthActor = {
      userId: user.id,
      sessionId: session.id,
      accountRole: user.accountRole,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      firmId: membership?.firmId ?? payload.firmId,
      memberId: membership?.id,
      isOwner: membership?.isOwner,
      clientIds: user.clientAccess.filter((a) => !a.revokedAt).map((a) => a.clientId),
    };

    done(null, actor);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
