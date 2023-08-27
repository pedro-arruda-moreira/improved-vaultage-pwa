import { Component, Inject, OnInit } from '@angular/core';
import { WINDOW } from 'src/app/platform/providers';
import { Promiser } from '../../../util/Promiser';

@Component({
  selector: 'app-password-generator',
  templateUrl: 'password.generator.component.html',
  styleUrls: ['password.generator.component.scss']
})
export class PasswordGeneratorComponent implements OnInit {
  constructor(@Inject(WINDOW) private readonly window: Window) {
  }

  public promiser = new Promiser<string>();

  public password: string = '';

  public length: number = 12;

  public type: PasswordType = PasswordType.STANDARD;

  public generatePassword(newType: string = this.type as string) {
    this.type = newType as PasswordType;
    switch(this.type) {
      case PasswordType.STANDARD: {
        this.password = (this.window as any).generatePassword(this.length, false);
        break;
      }
      case PasswordType.MEMORABLE: {
        this.password = (this.window as any).generatePassword(this.length);
        break;
      }
      case PasswordType.ALL_CHARS: {
        this.password = (this.window as any).generatePassword(this.length, false, /.*/);
        break;
      }
      case PasswordType.NUMBERS_ONLY: {
        this.password = (this.window as any).generatePassword(this.length, false, /[0-9]/);
        break;
      }
    }
  }
  public ngOnInit(): void {
    this.generatePassword();
  }

  public get generatedPassword(): Promise<string> {
    return this.promiser.promise;
  }
}

export enum PasswordType {
  STANDARD = '1',
  MEMORABLE = '2',
  ALL_CHARS = '3',
  NUMBERS_ONLY = '4'
}
