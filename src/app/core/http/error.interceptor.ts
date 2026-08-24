import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@/app/core/notification/notification.service';

interface FieldError {
    field: string;
    message: string;
}

interface ProblemDetail {
    title?: string;
    detail?: string;
    fieldErrors?: FieldError[];
}

function messageFor(error: HttpErrorResponse): string | null {
    if (error.status === 401) {
        // Session expirée : re-déclenchée par le authGuard à la prochaine navigation, pas de toast.
        return null;
    }

    const problem = error.error as ProblemDetail | null;
    if (problem?.fieldErrors?.length) {
        return problem.fieldErrors.map((fieldError) => `${fieldError.field} : ${fieldError.message}`).join(', ');
    }
    if (problem?.detail) {
        return problem.detail;
    }
    if (problem?.title) {
        return problem.title;
    }
    return `Une erreur est survenue (${error.status}).`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                const message = messageFor(error);
                if (message) {
                    notificationService.error(message);
                }
            }
            return throwError(() => error);
        })
    );
};
