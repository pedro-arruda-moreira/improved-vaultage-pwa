import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Promiser } from 'src/app/util/Promiser';

@Component({
  selector: 'app-password-prompt',
  templateUrl: 'password.prompt.component.html',
  styleUrls: ['password.prompt.component.scss']
})
export class PasswordPromptComponent {

  public passwordInputType: PasswordInputType = 'password';

  public promiser = new Promiser<string>();

  public text: string = 'Please confirm your master password';

  constructor(private readonly dialog: MatDialog) {}

  public togglePasswordVisibility() {
      this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
  }

  public get password(): Promise<string> {
    return this.promiser.promise;
  }

  public onKeyUp(pass: string, keyCode: number) {
    if(keyCode == 13) {
      this.promiser.resolve(pass);
      this.dialog.closeAll();
    }
  }

  public reject() {
    this.promiser.reject(new Error('Password prompt cancelled by user.'));
  }

}

type PasswordInputType = 'text' | 'password';