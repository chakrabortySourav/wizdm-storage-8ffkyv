import { Directive, Output, EventEmitter, HostListener } from '@angular/core';
import { AuthGuard } from './auth-guard.service';

@Directive({
  selector: '[authClick]'
})
export class AuthClickDirective {

  constructor(private auth: AuthGuard) { }

   /** Guarded click event */
  @Output() authClick = new EventEmitter<MouseEvent>();

  @HostListener('click', ['$event']) onClick(ev: MouseEvent) {

    this.auth.authenticate().then(user => {

      if(user) { this.authClick.emit(ev); }

    });
  }
}