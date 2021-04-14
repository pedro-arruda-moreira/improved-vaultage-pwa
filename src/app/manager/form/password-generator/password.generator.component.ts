import { Component } from '@angular/core';

@Component({
  selector: 'app-password-generator',
  templateUrl: 'password.generator.component.html',
  styleUrls: ['password.generator.component.scss']
})
export class PasswordGeneratorComponent {
  constructor() {
  }

  public password: string = '';

  public length: number = 8;

  public type: PasswordType = PasswordType.STANDARD;

  public generatePassword() {
    // TODO
  }

  public resolve() {
    // TODO
  }

  public reject() {
    // TODO
  }
}

export enum PasswordType {
  STANDARD = "1",
  MEMORABLE = "2",
  ALL_CHARS = "3"
}
