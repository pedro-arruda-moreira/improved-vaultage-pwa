import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Promiser } from 'src/app/util/Promiser';

@Component({
  selector: 'app-confirm-prompt',
  templateUrl: 'confirm.prompt.component.html',
  styleUrls: ['confirm.prompt.component.scss']
})
export class ConfirmPromptComponent {

  public promiser = new Promiser<boolean>();

  public text: string = 'Are you sure?';

  constructor(private readonly dialog: MatDialog) {}

  public get result(): Promise<boolean> {
    return this.promiser.promise;
  }

  public yes() {
    this.promiser.resolve(true);
  }

  public no() {
    this.promiser.resolve(false);
  }

}