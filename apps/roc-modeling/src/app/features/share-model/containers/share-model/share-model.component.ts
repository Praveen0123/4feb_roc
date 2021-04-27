import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { ShareRoiAggregateModel } from '@app/+state/roi-collection/state';
import { NavigationService } from '@app/core/services';
import { RoiModelDto } from '@app/domain';
import { UserType } from '@gql';
import { Observable } from 'rxjs';

@Component({
  selector: 'roc-share-model',
  templateUrl: './share-model.component.html',
  styleUrls: ['./share-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareModelComponent implements OnInit
{
  formGroup: FormGroup;
  userType = UserType;
  roiModelList$: Observable<RoiModelDto[]>;

  constructor
    (
      private formBuilder: FormBuilder,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private navigationService: NavigationService
    ) { }

  ngOnInit()
  {
    this.buildForm();

    this.roiModelList$ = this.roiCollectionFacadeService.getRoiModelList$();
  }

  onSaveClick(): void
  {
    if (this.formGroup.valid)
    {
      const shareRoiAggregateModel: ShareRoiAggregateModel =
      {
        firstName: this.formGroup.controls.firstName.value,
        lastName: this.formGroup.controls.lastName.value,
        emailAddress: this.formGroup.controls.emailAddress.value,
        userType: this.formGroup.controls.userType.value
      };

      this.roiCollectionFacadeService.shareRoiAggregate(shareRoiAggregateModel);
    }
  }

  // Preserve original property order
  originalOrder = (_a: KeyValue<number, string>, _b: KeyValue<number, string>): number =>
  {
    return 0;
  };

  onCancelClick(): void
  {
    this.navigationService.goToModelingPage();
  }



  private buildForm()
  {
    this.formGroup = this.formBuilder.group
      ({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        emailAddress: new FormControl('', [Validators.required, Validators.email]),
        userType: new FormControl(UserType.Student, [Validators.required])
      });
  }

}
