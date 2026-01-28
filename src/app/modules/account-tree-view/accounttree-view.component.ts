import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { IAccountType } from 'app/entities/financemicro/account-type/account-type.model';
import { Location } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { MatIcon } from '@angular/material/icon';

interface AccountTreeNode {
  name: string;
  fullPath: string;
  code?: string;
  children?: AccountTreeNode[];
}

@Component({
  selector: 'app-accounttree-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTreeModule,
    MatIcon,
    MatButtonModule,
    MatTreeModule,
    MatIcon,
    MatDialogModule
  ],
  templateUrl: './accounttree-view.component.html',
  styleUrl: './accounttree-view.component.scss',
})
export class AccounttreeViewComponent implements OnInit {

  private accountTypeService = inject(AccountTypeService);
  constructor(

  public dialogRef: MatDialogRef<AccounttreeViewComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {}

  mainAccounts = [
  { label: 'Assets', key: 'Asset' },
  { label: 'Liabilities', key: 'Liability' },
  { label: 'Income', key: 'Income' },
  { label: 'Expense', key: 'Expense' },
  { label: 'Equity', key: 'Equity' },
];

  fullTree: AccountTreeNode[] = [];

  allAccounts: IAccountType[] = [];
  treeData: AccountTreeNode[] = [];

  selectedRoot: string | null = null;

  ngOnInit(): void {
    this.loadAllAccounts();
  }

  loadAllAccounts(): void {
  this.accountTypeService.query({ size: 1000 }).subscribe({
    next: res => {
      this.allAccounts = res.body || [];
      this.fullTree = this.buildFullTree(this.allAccounts);
      this.treeData = this.fullTree; // show all by default
    },
    error: err => console.error(err)
  });
}


buildFullTree(accounts: IAccountType[]): AccountTreeNode[] {
  const roots: AccountTreeNode[] = [];

  accounts.forEach(acc => {
    if (!acc.lmu) return;

    const parts = acc.lmu.split('/').filter(Boolean);

    let currentLevel = roots;

    parts.forEach((part, index) => {
      let node = currentLevel.find(n => n.name === part);

      if (!node) {
        node = {
          name: part,
          fullPath: parts.slice(0, index + 1).join('/'),
          children: []
        };
        currentLevel.push(node);
      }

      if (index === parts.length - 1) {
        node.code = acc.code;
      }

      currentLevel = node.children!;
    });
  });

  return roots;
}

  onMainAccountClick(rootKey: string): void {
  this.selectedRoot = rootKey;

  const foundRoot = this.fullTree.find(
    r => r.name === rootKey
  );

  this.treeData = foundRoot ? [foundRoot] : [];
}

showAll(): void {
  this.selectedRoot = null;
  this.treeData = this.fullTree;
}




  /**
   * Converts flat paths into a tree
   */
  buildTree(accounts: IAccountType[], root: string): AccountTreeNode[] {
    const rootNode: AccountTreeNode = {
      name: root,
      fullPath: root,
      children: []
    };

    accounts.forEach(acc => {
      const parts = acc.lmu.split('/').filter(Boolean);
      let current = rootNode;

      parts.slice(1).forEach(part => {
        let child = current.children!.find(c => c.name === part);

        if (!child) {
          child = {
            name: part,
            fullPath: current.fullPath + '/' + part,
            children: []
          };
          current.children!.push(child);
        }

        current = child;
      });
    });

    return [rootNode];
  }

  getChildren = (node: AccountTreeNode): AccountTreeNode[] => {
  return node.children ?? [];
};


  hasChild = (_: number, node: AccountTreeNode) =>
    !!node.children && node.children.length > 0;

  close(): void {
  this.dialogRef.close();
}


}
