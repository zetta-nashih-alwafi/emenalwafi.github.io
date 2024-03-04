import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-template-sequence-preview',
  templateUrl: './template-sequence-preview.component.html',
  styleUrls: ['./template-sequence-preview.component.scss'],
})
export class TemplateSequencePreviewComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  @Input() data: any;

  constructor(
    private translate: TranslateService,
    public permissionService: PermissionService,
    private intakeService: IntakeChannelService,
  ) {}

  ngOnInit() {
    console.log('cf08',this.data)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

interface ModuleSubject {
  name: string;
  volume_student_total: number;
  volume_hours_total: number;
  ects: string;
}

interface SequenceModule {
  name: string;
  ects: number;
  subjects: ModuleSubject[];
}

interface Sequence {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  type_of_sequence: string;
  modules: SequenceModule[];
}

interface PreviewData {
  name: string;
  description: string;
  sequences: Sequence[];
}
