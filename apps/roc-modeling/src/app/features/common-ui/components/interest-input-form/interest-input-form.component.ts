import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { InterestPageInputFormService } from '../../../../core/services/interest-page-input-form/interest-page-input-form.service';
import { interestInputForm } from '../../../../core/models/interest-page-input-form/interest-page-input-form';
import { NotificationService } from '@app/core/services/notification/notification.service';
// import { AlertService } from '../../../../core/services/alert.service';


@Component({
  selector: 'roc-interest-input-form',
  templateUrl: './interest-input-form.component.html',
  styleUrls: ['./interest-input-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestInputFormComponent implements OnInit
{



  interestInputForm: FormGroup;
  products = [
    'ROC for high schools',
    'ROC for colleges',
    ' ROC for job centers',

  ];
  jobtitleSelectedValue: MatSelectChange;
  productSelectedValue: MatSelectChange;
  tuitionFeesUpdate: string;
  constructor(public dialogRef: MatDialogRef<InterestInputFormComponent>, private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private _interestInput: InterestPageInputFormService, private notificationService: NotificationService,)
  {
    this.createsFeedbackForm();
  }


  createsFeedbackForm()
  {
    this.interestInputForm = this.fb.group({
      // first_name: [''],
      // last_name: [''],
      // email: [''],
      // phone: [''],
      // organization: [''],
      // job_title: [''],
      // products: [''],
      // description: [''],
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      // email: new FormControl('', [Validators.required, Validators.email]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      phone: new FormControl(''),
      organization: new FormControl('', [Validators.required]),
      job_title: new FormControl('', [Validators.required]),
      products: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),


    });
  }


  ngOnInit(): void
  {
    // this.interestInputForm.getPosts().subscribe((r)=>{
    //   console.log("re",r);
    // })
    // this.ionViewWillEnter();
    // this.onsumbit();

  }

  // ionViewWillEnter()
  // {

  //   this._interestInput.getStats().subscribe(stats =>
  //   {
  //     console.log(stats);
  //   });
  // }
  // CLOSE DIALOG WITH CLOSE ICON
  close(): void
  {
    this.dialogRef.close();
  }
  // DEGREE ALIGNMENT WITH CAREER FILTER
  productSelected(selectedValue: MatSelectChange): void
  {
    console.log(selectedValue, "selected");
    this.productSelectedValue = selectedValue;
  }

  jobtitleSelected(selectedValue: MatSelectChange): void
  {
    console.log(selectedValue, "selected");
    this.jobtitleSelectedValue = selectedValue;
  }



  // onlyNumber(event: any)
  // {
  //   var x;
  //   x = event.charCode;
  //   return x > 47 && x < 58;
  // }

  onsumbit()
  {
    const submitFormData: interestInputForm = {
      first_name: this.interestInputForm.controls.first_name.value,
      last_name: this.interestInputForm.controls.last_name.value,
      email: this.interestInputForm.controls.email.value,
      phone: this.interestInputForm.controls.phone.value,
      organization: this.interestInputForm.controls.organization.value,
      job_title: this.interestInputForm.controls.job_title.value,
      product: this.interestInputForm.controls.products.value,
      description: this.interestInputForm.controls.description.value,

    };

    console.log(submitFormData);
    this._interestInput.postinterestInput(submitFormData).subscribe((data) =>
    {

      if (data)
      {
        this.notificationService.success("Thank you for your interest in ROC.One of our product experts will contact you shortly.");
      }
      else
        this.notificationService.error(this.data.useCaseError).afterDismissed();
      console.log("i'm from service.........", data, submitFormData);
      this.dialogRef.close(this.data);

      return data;
    });





  }

}
