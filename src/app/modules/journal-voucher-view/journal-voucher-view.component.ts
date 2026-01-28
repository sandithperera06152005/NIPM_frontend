import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { JournalVoucherService } from 'app/entities/financemicro/journal-voucher/service/journal-voucher.service';
import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';

@Component({
  selector: 'app-journal-voucher-view',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './journal-voucher-view.component.html',
  styleUrls: ['./journal-voucher-view.component.scss']
})
export class JournalVoucherViewComponent implements OnInit {

  private _dialogRef = inject(MatDialogRef<JournalVoucherViewComponent>);
  private _journalVoucherService = inject(JournalVoucherService);
  private _accountsService = inject(AccountsService);

  voucher: any;
  entries: any[] = [];

  displayedColumns: string[] = [
    'serialNo',
    'accountCode',
    'debit',
    'credit',
    'comments'
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number }) {}

  ngOnInit(): void {
    this.loadVoucher();
    this.loadEntries();
  }

  // Load Voucher Main Info
  private loadVoucher(): void {
    this._journalVoucherService.find(this.data.id).subscribe(res => {
      this.voucher = res.body;
    });
  }

  // Load Journal Entries from ACCOUNTS table (based on voucher code)
  private loadEntries(): void {
    this._accountsService.query({
      'code.equals': this.data.id,
      size: 1000
    }).subscribe(res => {
      this.entries = res.body || [];
    });
  }

  close(): void {
    this._dialogRef.close();
  }
}
