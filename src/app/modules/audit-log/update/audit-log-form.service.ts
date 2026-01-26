import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAuditLog, NewAuditLog } from '../audit-log.model';



type AuditLogFormGroupInput = IAuditLog | Partial<NewAuditLog>;
type AuditLogFormRawValue = IAuditLog;
export type AuditLogFormGroup = FormGroup<{
  id: FormControl<IAuditLog['id'] | NewAuditLog['id']>;
  
  action: FormControl<IAuditLog['action']>;
  
  entityName: FormControl<IAuditLog['entityName']>;
  
  entityId: FormControl<IAuditLog['entityId']>;
  
  performedAt: FormControl<IAuditLog['performedAt']>;
  
  ipAddress: FormControl<IAuditLog['ipAddress']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class AuditLogFormService {
  createAuditLogFormGroup(entity: AuditLogFormGroupInput = { id: null }): AuditLogFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      action: new FormControl(entity.action),
      
      entityName: new FormControl(entity.entityName),
      
      entityId: new FormControl(entity.entityId),
      
      performedAt: new FormControl(entity.performedAt),
      
      ipAddress: new FormControl(entity.ipAddress),
      
      
    });
    return form;
  }

  getAuditLog(form: AuditLogFormGroup): IAuditLog | NewAuditLog {
    return form.getRawValue() as IAuditLog | NewAuditLog;
  }

  resetForm(form: AuditLogFormGroup, entity: AuditLogFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
