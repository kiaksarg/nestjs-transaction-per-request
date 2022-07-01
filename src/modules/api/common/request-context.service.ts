import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';

import { RequestContext } from './request-context';

/**
 * Creates new RequestContext instances.
 */
@Injectable()
export class RequestContextService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  /**
   * Creates a new RequestContext based on an Express request object.
   */
  async fromRequest(req: Request): Promise<RequestContext> {
    // const hasOwnerPermission = !!requiredPermissions && requiredPermissions.includes(Permission.Owner);
    // const user = session && session.user;
    // const isAuthorized = this.userHasRequiredPermissionsOnChannel(requiredPermissions, channel, user);
    // const authorizedAsOwnerOnly = !isAuthorized && hasOwnerPermission;
    // const translationFn = (req as any).t;
    return new RequestContext({
      req,
    });
  }

  // /**
  //  * Returns true if any element of arr1 appears in arr2.
  //  */
  // private arraysIntersect<T>(arr1: T[], arr2: T[]): boolean {
  //     return arr1.reduce((intersects, role) => {
  //         return intersects || arr2.includes(role);
  //     }, false as boolean);
  // }
}
