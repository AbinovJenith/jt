import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService, AuditAction } from '../audit/audit.service';

const METHOD_ACTION: Record<string, AuditAction> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

/** Words that appear in the second URL segment but are NOT resource IDs */
const SUB_ROUTES = new Set([
  'status', 'items', 'variants', 'attributes', 'payments', 'invoice',
  'products', 'receive', 'adjust', 'me', 'profile', 'orders', 'catalog',
]);

function parseRoute(url: string): { resource: string; resourceId?: string } {
  const clean = url.replace(/^\/api\/v1\//, '').split('?')[0];
  const parts = clean.split('/').filter(Boolean);

  // "purchase-orders" → "PurchaseOrder", "rfq" → "Rfq"
  const rawSegment = parts[0] ?? 'unknown';
  const resource = rawSegment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
    .replace(/s$/, ''); // naïve de-pluralise

  const second = parts[1];
  const resourceId =
    second && !SUB_ROUTES.has(second) ? second : undefined;

  return { resource, resourceId };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const action = METHOD_ACTION[req.method as string];
    if (!action) return next.handle(); // GET / HEAD — skip

    const { resource, resourceId } = parseRoute(req.url as string);
    const userId: string | undefined = req.user?.id;
    const ipAddress: string =
      (req.headers['x-forwarded-for'] as string) ?? req.ip ?? 'unknown';
    const userAgent: string = (req.headers['user-agent'] as string) ?? '';

    return next.handle().pipe(
      tap((response) => {
        const newData = response?.data ?? response;
        this.audit.log({
          userId,
          action,
          resource,
          resourceId:
            resourceId ??
            (newData && typeof newData === 'object' ? newData?.id : undefined),
          newData: action === 'DELETE' ? undefined : newData,
          ipAddress,
          userAgent,
        });
      }),
    );
  }
}
