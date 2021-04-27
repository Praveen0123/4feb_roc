import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RoiCollectionFacadeService } from '@app/+state/roi-collection';
import { NavigationService } from '@app/core/services';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { RoiModelService, RoiModelToSaveDto } from '@app/domain';

@Component({
  selector: 'roc-collection-call-to-action',
  templateUrl: './collection-call-to-action.component.html',
  styleUrls: ['./collection-call-to-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCallToActionComponent implements OnInit
{
  @Output('onShare') shareEventEmitter = new EventEmitter<void>();

  constructor
    (
      private roiModelService: RoiModelService,
      private roiCollectionFacadeService: RoiCollectionFacadeService,
      private navigationService: NavigationService,
      private notificationService: NotificationService,
      private clipboard: Clipboard
    ) { }


  ngOnInit(): void
  {
  }

  async onCopyRoiAggregateModel()
  {
    const roiModelToSaveDto: RoiModelToSaveDto = await this.roiModelService.fromAggregateToSaveModel();

    const pending = this.clipboard.beginCopy(JSON.stringify(roiModelToSaveDto));
    let remainingAttempts = 3;

    const attempt = () =>
    {
      const pendingCopy = pending.copy();

      if (!pendingCopy && --remainingAttempts)
      {
        setTimeout(attempt);
      }
      else
      {
        this.notificationService.success('copy successful');
        // Remember to destroy when you're done!
        pending.destroy();
      }
    };
    attempt();
  }

  onShareClick()
  {
    this.navigationService.goToShareModelPage();
  }

  onViewShareHistoryClick()
  {
    if (this.shareEventEmitter.observers.length > 0)
    {
      this.shareEventEmitter.emit();
    }
  }

  onAddNewModel()
  {
    this.roiCollectionFacadeService.createNewRoiModel();
  }

  onDeleteCollection()
  {
  }

}
