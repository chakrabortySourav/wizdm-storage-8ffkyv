import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConnectModule, ConnectConfig } from './connect';
import { AuthModule } from './connect/auth';
import { StorageModule } from './connect/storage';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { FileSizePipe } from './utils/file-size.pipe';
import { MomentPipe } from './utils/moment.pipe';
import { UriEncodePipe } from './utils/uri.pipe';
import { AuthClickDirective } from './utils/auth-click.directive';
import { DownloadDirective } from './utils/download.directive';
import { environment } from '../environments/environment';

@NgModule({
  imports:      [   
    BrowserModule, 
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule, 
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatProgressBarModule,
    // Initialize the connect module
    ConnectModule.init(environment.firebase, 'uploads'),
    AuthModule,
    StorageModule,
    LoginModule
  ],
  
  declarations: [ AppComponent, FileSizePipe, MomentPipe, UriEncodePipe, AuthClickDirective, DownloadDirective ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
