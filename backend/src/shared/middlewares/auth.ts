import { AccountRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';

import ApiError from '@/shared/utils/api-error';
import { AuthActor } from '@/types/response';

const verifyCallback =
  (req: Request, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void) =>
  async (err: unknown, actor: AuthActor | false) => {
    if (err || !actor) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = actor;
    resolve();
  };

/** Verifies the access token and attaches the resolved actor to req.user. */
export const authenticate = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(
          req,
          res,
          next
        );
      });
      next();
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.statusCode).json({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
        return;
      }
      next(err);
    }
  };
};

/** Restricts a route to one or more account roles. Must run after authenticate(). */
export const requireRole = (...roles: AccountRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const actor = req.user as AuthActor | undefined;
    if (!actor) {
      res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Please authenticate',
      });
      return;
    }
    if (!roles.includes(actor.accountRole)) {
      res.status(httpStatus.FORBIDDEN).json({
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message: 'Forbidden',
      });
      return;
    }
    next();
  };
};

export const requirePlatformOwner = requireRole(AccountRole.PLATFORM_OWNER);
export const requireFirmAdmin = requireRole(AccountRole.FIRM_ADMIN);
export const requireFirmStaff = requireRole(AccountRole.FIRM_ADMIN, AccountRole.FIRM_TEAM);
export const requireClient = requireRole(AccountRole.FIRM_CLIENT);

// Default export kept for call sites that only need authentication.
const auth = authenticate;
export default auth;
