import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatCommonModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MAT_DIALOG_DATA,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { VoiceRecognitionService } from 'app/service/voice-recognition/voice-recognition.service';
import { BehaviorSubject, Subject } from 'rxjs';

import { SpeechToTextDialogComponent } from './speech-to-text-dialog.component';

describe('SpeechToTextDialogComponent', () => {
  let component: SpeechToTextDialogComponent;
  let fixture: ComponentFixture<SpeechToTextDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpeechToTextDialogComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatIconModule,
        MatInputModule,
        MatDialogModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        TextFieldModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [
        { provide: VoiceRecognitionService, useClass: VoiceRecognitionServiceStub },
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeechToTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call #init on VoiceRecognitionService', () => {
    const service = TestBed.get(VoiceRecognitionService);
    spyOn(service, 'init');
    component.ngOnInit();
    expect(service.init).toHaveBeenCalled();
  });

  it('should have #listenFormControl to listen to the text input value changes', fakeAsync(() => {
    const debounceTimeInMs = 800;
    const service = TestBed.get(VoiceRecognitionService);
    spyOn(service, 'updateText');
    component.textInput.patchValue('testing', { emitEvent: true });
    tick(debounceTimeInMs);
    expect(service.updateText).toHaveBeenCalledWith('testing');
  }));

  it('should have #listenVoice to listen to the text data from VoiceRecognitionService', () => {
    const service = TestBed.get(VoiceRecognitionService);
    service.updateText('testing');
    expect(component.textInput.value).toBe('testing');
  });

  it('should call #startListening on VoiceRecognitionService', () => {
    const service = TestBed.get(VoiceRecognitionService);
    spyOn(service, 'startListening');
    component.startListening();
    expect(service.startListening).toHaveBeenCalled();
  });

  it('should have #submit call #abort on VoiceRecognitionService', () => {
    const service = TestBed.get(VoiceRecognitionService);
    spyOn(service, 'abort');
    component.submit();
    expect(service.abort).toHaveBeenCalled();
  });

  it('should have #closeDialog call #abort on VoiceRecognitionService', () => {
    const service = TestBed.get(VoiceRecognitionService);
    spyOn(service, 'abort');
    component.closeDialog();
    expect(service.abort).toHaveBeenCalled();
  });

  it('should have #submit close the dialog passing the text input value', () => {
    const ref = TestBed.get(MatDialogRef);
    spyOn(ref, 'close');
    component.textInput.setValue('testing');
    component.submit();
    expect(ref.close).toHaveBeenCalledWith('testing');
  });

  it('should have #closeDialog close the dialog passing the dialog data', () => {
    const ref = TestBed.get(MatDialogRef);
    spyOn(ref, 'close');
    component.data = { key: 'value' };
    component.closeDialog();
    expect(ref.close).toHaveBeenCalledWith({ key: 'value' });
  });
});

class MatDialogRefStub {
  close = () => {};
}

class VoiceRecognitionServiceStub {
  words$ = new Subject<{ [key: string]: string }>();
  errors$ = new Subject<{ [key: string]: any }>();
  listening = false;
  textSource = new BehaviorSubject('');
  textData$ = this.textSource.asObservable();
  updateText = (val: string) => {
    this.textSource.next(val);
  };
  getText = () => {};
  resetText = () => {};
  init = () => {};
  startListening = () => {};
  abort = () => {};
  swalErrorAnnyang = () => {};
}
