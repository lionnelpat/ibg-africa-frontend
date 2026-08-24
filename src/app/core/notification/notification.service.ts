import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    success(detail: string): void {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 3000 });
    }

    error(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
    }

    confirmDelete(message: string, onAccept: () => void): void {
        this.confirmationService.confirm({
            message,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Supprimer', severity: 'danger' },
            rejectButtonProps: { label: 'Annuler', severity: 'secondary', outlined: true },
            accept: onAccept
        });
    }
}
