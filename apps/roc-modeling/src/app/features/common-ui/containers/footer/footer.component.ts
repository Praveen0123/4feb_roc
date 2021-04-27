import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '@app/core/services';
import { InterestInputFormComponent } from '../../components/interest-input-form/interest-input-form.component';

@Component({
  selector: 'roc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit
{

  constructor
    (
      private navigationService: NavigationService, public dialog: MatDialog
    ) { }

  ngOnInit(): void
  {
  }

  onAbout()
  {
    this.navigationService.goToAboutPage();
  }

  openDialogFeedbackForm(): void
  {
    const dialogRef = this.dialog.open(InterestInputFormComponent, {

      height: '692px',
      width: '786px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) =>
    {
      console.log('School finder Dialog Close', result);
      // alert("submit successful");
    });
  }

}
