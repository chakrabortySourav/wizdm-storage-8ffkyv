import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataSource, CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { StorageFolder, StorageFile, FileSummary } from './connect/storage/extras';
import { Observable, BehaviorSubject ,forkJoin, of, combineLatest, concat, merge } from 'rxjs';
import { tap, map, catchError, switchMap, startWith } from 'rxjs/operators';
import { StorageService, UploadObservable } from './connect/storage';
import { AuthGuard } from './utils/auth-guard.service';
import { MediaObserver } from '@angular/flex-layout';
import { Sort } from '@angular/material/sort';

export interface UploadRecord {
  file: StorageFile;
  data: FileSummary;
}

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: { 'class': 'mat-typography' }
})
export class AppComponent extends StorageFolder implements DataSource<UploadRecord> {

  readonly sortBy$ = new BehaviorSubject<Sort>({ active: 'name', direction: 'asc' });

  private selection = new SelectionModel<UploadRecord>(true, []);
  private allRecords: UploadRecord[] = [];

  readonly userName$: Observable<string>;

  public uploading: boolean = false;
  public deleting: boolean = false;
    
  get busy(): boolean { return this.uploading || this.deleting; }

   /** True on small screen devices */
  get mobile(): boolean { return this.media.isActive('xs'); }

  get displayedColumns(): string[] {
                         // Limited columns on small display
    return this.mobile ? ['select', 'name', 'download'] 
                         // Full columns on large display
                       : ['select', 'name', 'size', 'type', 'updated', 'download'];
  }

  constructor(private store: StorageService, private media: MediaObserver, readonly guard: AuthGuard) {
    // Constructs the 'shared' folder
    super(store, 'shared');

    // Streams the user name from the profile
    this.userName$ = this.guard.auth.user$.pipe(
      map( data => !!data ? data.displayName : '')
    );
  }

  connect(collectionViewer: CollectionViewer): Observable<UploadRecord[]> {

    // Lists the files from the StorageFolder
    return this.files$.pipe( 

      // Combines the StorageFile[] into UploadRecord[]
      switchMap( files => files.length > 0 ? combineLatest( files.map( file => 
        // Maps the file summary together with the file instance into records
        file.summary$.pipe( map( data => ({ file, data } as UploadRecord) ) ))
        // Skips on an empty arrays
      ) : of([])),

      // Clears the selection whenever the records change
      tap( () => this.selection.clear() ),

      // Sorts the records by the given column
      switchMap( records => this.sortBy$.pipe( map( sortBy => {

        // Gets the sorting direction first
        const dir = sortBy.direction == 'asc' ? 1 : -1;

        // Sorts the array
        return records.sort((a, b) => {

          // Geta A value pushing it last when undefined (uploading?)
          const valueA = a.data[sortBy.active];
          if(!valueA) { return 1; }

          // Geta B value pushing it last when undefined (uploading?)
          const valueB = b.data[sortBy.active];
          if(!valueB) { return -1; }

          // Compares A vs B
          return (valueA > valueB) ? dir : ( (valueA < valueB) ? -dir : 0);
        });
        
      }))),    
      // Keeps track on the full list of records
      tap( files => this.allRecords = files ) 
    );
  }

  disconnect(collectionViewer: CollectionViewer){ 
    this.allRecords = [];
  }

  /** Splits a FileList into an array of all files plus an array of alreadt existing files */
  private listFiles(list: FileList) {

    let allFiles: File[] = [], existingFiles: File[] = [];

    for(let i = 0; i < list.length; i++) {
      
      const item = list.item(i);

      if(this.allRecords.some( rec => rec.data.name === item.name)) { existingFiles.push(item); }
      
      allFiles.push(item);
    }

    return { allFiles, existingFiles };
  }

  /** Uloads the given list of files */
  public uploadFiles(list: FileList) {

    if(list.length <= 0) { return; }

    // Splits the file list in all files and already existing files
    const { allFiles, existingFiles } = this.listFiles(list);

    // Tracks the uploading progress
    this.uploading = true;

    // Starts uploading the given files and waits for all to complete. Catch errors since it is likely a user cancellation
    forkJoin( allFiles.map( file => this.upload(file, { contentType: file.type }).pipe( catchError( () => of(null) ) ) ) ).toPromise().then( uploads => {

      // Checks for overrides or cancellations to re-list the files
      if(existingFiles.length > 0 || uploads.some( upload => upload === null)) { 
        
        this.ls("."); 
      }

      this.uploading = false;
    });
  }

  /** Deletes the selected files */
  public deleteFiles() {

    // Skips when no files are selected
    if(this.isNoneSelected()) { return; }

    // Traks the deletion process
    this.deleting = true;

    // Deletes all the selected files waiting for all to complete
    Promise.all( this.selection.selected.map( rec => rec.file.delete() ) ).then( () => {
      
      // Re-lists the files
      this.ls(".");

      // Resets the flags
      this.deleting = false;
    });
  }

  /** Toggles the given selection. Reverts toggling the full list whenever record is omitted */
  public toggleSelection(record?: UploadRecord) {

    if(record) { this.selection.toggle(record); }
    else {

      if(this.isAllSelected()) { this.selection.clear(); }
      else { this.allRecords.forEach( record => this.selection.select(record) ); }
    }
  }

  /** Returns true if the given record is selected */
  public isSelected(record: UploadRecord) {
    return this.selection.isSelected(record);
  }

  /** Returns true when all files are selected */
  public isAllSelected(): boolean {
    return this.allRecords.length > 0 && (this.allRecords.length === this.selection.selected.length);
  }

  /** Returns true when some of the files are selected */
  public isPartlySelected(): boolean {
    return (this.selection.selected.length > 0) && !this.isAllSelected();
  }

  /** Returns true when no files are selected */
  public isNoneSelected(): boolean {
    return this.allRecords.length === 0 || this.selection.selected.length <= 0;
  } 
}