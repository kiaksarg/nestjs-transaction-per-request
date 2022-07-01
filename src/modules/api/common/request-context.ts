/* eslint @typescript-eslint/no-inferrable-types: "off" */
import { isObject } from '../../../utils/shared-utils';
import { Request } from 'express';

export type SerializedRequestContext = {
  _req?: any;
};

/**
 * @description
 * The RequestContext holds information relevant to the current request, which may be
 * required at various points of the stack.
 *
 * It is a good practice to inject the RequestContext (using the {@link Ctx} decorator) into
 * _all_ resolvers & REST handlers, and then pass it through to the service layer.
 *
 * This allows the service layer to access information about the current user, the active language,
 * the active Channel, and so on. In addition, the {@link TransactionalConnection} relies on the
 * presence of the RequestContext object in order to correctly handle per-request database transactions.
 *
 * @example
 * ```TypeScript
 * \@Query()
 * myQuery(\@Ctx() ctx: RequestContext) {
 *   return this.myService.getData(ctx);
 * }
 * ```
 * @docsCategory request
 */
export class RequestContext {
  private readonly _isAuthorized: boolean;
  private readonly _req?: Request;

  /**
   * @internal
   */
  constructor(options: { req?: Request }) {
    const { req } = options;
    this._req = req;
  }

  /**
   * @description
   * Creates a new RequestContext object from a serialized object created by the
   * `serialize()` method.
   */
  static deserialize(ctxObject: SerializedRequestContext): RequestContext {
    return new RequestContext({
      req: ctxObject._req as any,
    });
  }

  /**
   * @description
   * Serializes the RequestContext object into a JSON-compatible simple object.
   * This is useful when you need to send a RequestContext object to another
   * process, e.g. to pass it to the Job Queue via the {@link JobQueueService}.
   */
  serialize(): SerializedRequestContext {
    const serializableThis: any = Object.assign({}, this);
    if (this._req) {
      serializableThis._req = this.shallowCloneRequestObject(this._req);
    }
    return JSON.parse(JSON.stringify(serializableThis));
  }

  /**
   * @description
   * Creates a shallow copy of the RequestContext instance. This means that
   * mutations to the copy itself will not affect the original, but deep mutations
   * (e.g. copy.channel.code = 'new') *will* also affect the original.
   */
  copy(): RequestContext {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  /**
   * @description
   * The raw Express request object.
   */
  get req(): Request | undefined {
    return this._req;
  }

  /**
   * @description
   * True if the current session is authorized to access the current resolver method.
   *
   * @deprecated Use `userHasPermissions()` method instead.
   */
  get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  /**
   * Returns true if any element of arr1 appears in arr2.
   */
  private arraysIntersect<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.reduce((intersects, role) => {
      return intersects || arr2.includes(role);
    }, false as boolean);
  }

  /**
   * The Express "Request" object is huge and contains many circular
   * references. We will preserve just a subset of the whole, by preserving
   * only the serializable properties up to 2 levels deep.
   * @private
   */
  private shallowCloneRequestObject(req: Request) {
    function copySimpleFieldsToDepth(target: any, maxDepth: number, depth: number = 0) {
      const result: any = {};
      // tslint:disable-next-line:forin
      for (const key in target) {
        if (key === 'host' && depth === 0) {
          // avoid Express "deprecated: req.host" warning
          continue;
        }
        let val: any;
        try {
          val = (target as any)[key];
        } catch (e) {
          val = String(e);
        }

        if (Array.isArray(val)) {
          depth++;
          result[key] = val.map((v) => {
            if (!isObject(v) && typeof val !== 'function') {
              return v;
            } else {
              return copySimpleFieldsToDepth(v, maxDepth, depth);
            }
          });
          depth--;
        } else if (!isObject(val) && typeof val !== 'function') {
          result[key] = val;
        } else if (depth < maxDepth) {
          depth++;
          result[key] = copySimpleFieldsToDepth(val, maxDepth, depth);
          depth--;
        }
      }
      return result;
    }
    return copySimpleFieldsToDepth(req, 1);
  }
}
