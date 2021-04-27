import { Injectable } from '@angular/core';
import { CareerGoalForm, CurrentInformationForm, EducationCostForm } from '@app/core/models';
import { DialogDataToKeepModel, EducationFinancingDto, RoiModelDto, RoiModelService, UserModelDto } from '@app/domain';
import { RoiAggregateCardModel } from '@gql';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  cloneRoiModel,
  createNewAggregate,
  createNewRoiModel,
  deleteRoiModel,
  processCareerGoalForm,
  processCurrentInformationForm,
  processEducationCostForm,
  processEducationFinancingForm,
  renameAggregate,
  renameModel,
  requestCollectionAllFromDatastore,
  requestCollectionBySearchTermFromDatastore,
  requestCollectionMostRecentFromDatastore,
  requestCollectionSharedFromFromDatastore,
  requestCollectionSharedWithFromDatastore,
  requestMakeRoiModelActive,
  requestMostRecentAggregate,
  requestRoiAggregateFromSearchPage,
  resetAggregate,
  shareRoiAggregate,
} from './actions';
import { getActiveRoiAggregateId, getActiveRoiModelDto, getActiveUserModelDto, getCollectionCount, getCollectionFilterType, getCollectionList, getSelectedRoiModelId } from './selectors';
import { CollectionFilterEnum, ShareRoiAggregateModel } from './state';


@Injectable({
  providedIn: 'root'
})
export class RoiCollectionFacadeService
{

  constructor
    (
      private store: Store,
      private roiModelService: RoiModelService
    )
  {
  }


  /* #region  COLLECTION ACTIONS */

  requestMostRecentAggregate()
  {
    return this.store.dispatch(requestMostRecentAggregate());
  }

  requestCollectionAllFromDatastore()
  {
    return this.store.dispatch(requestCollectionAllFromDatastore());
  }
  requestCollectionBySearchTermFromDatastore(searchTerm: string)
  {
    return this.store.dispatch(requestCollectionBySearchTermFromDatastore({ searchTerm }));
  }
  requestCollectionMostRecentFromDatastore()
  {
    return this.store.dispatch(requestCollectionMostRecentFromDatastore());
  }
  requestCollectionSharedFromFromDatastore()
  {
    return this.store.dispatch(requestCollectionSharedFromFromDatastore());
  }

  requestCollectionSharedWithFromDatastore()
  {
    return this.store.dispatch(requestCollectionSharedWithFromDatastore());
  }

  getCollection$(): Observable<RoiAggregateCardModel[]>
  {
    return this.store.pipe(select(getCollectionList));
  }
  getActiveRoiAggregateId$(): Observable<string>
  {
    return this.store.pipe(select(getActiveRoiAggregateId));
  }
  getCollectionCount$(): Observable<number>
  {
    return this.store.pipe(select(getCollectionCount));
  }


  getCollectionFilterType$(): Observable<CollectionFilterEnum>
  {
    return this.store.pipe(select(getCollectionFilterType));
  }

  /* #endregion */





  /* #region  ROI AGGREGATE ACTIONS */

  requestRoiAggregateFromSearchPage(roiAggregateCardModel: RoiAggregateCardModel)
  {
    return this.store.dispatch(requestRoiAggregateFromSearchPage({ roiAggregateCardModel }));
  }
  renameAggregate(name: string)
  {
    return this.store.dispatch(renameAggregate({ name }));
  }
  shareRoiAggregate(shareRoiAggregateModel: ShareRoiAggregateModel)
  {
    return this.store.dispatch(shareRoiAggregate({ shareRoiAggregateModel }));
  }
  resetAggregate()
  {
    return this.store.dispatch(resetAggregate());
  }
  createNewAggregate()
  {
    return this.store.dispatch(createNewAggregate());
  }

  /* #endregion */





  /* #region  ROI MODEL ACTIONS */

  createNewRoiModel()
  {
    return this.store.dispatch(createNewRoiModel());
  }
  renameModel(name: string)
  {
    return this.store.dispatch(renameModel({ name }));
  }
  cloneRoiModel(dialogDataToKeepModel: DialogDataToKeepModel)
  {
    return this.store.dispatch(cloneRoiModel({ dialogDataToKeepModel }));
  }
  requestMakeRoiModelActive(roiModelDto: RoiModelDto)
  {
    return this.store.dispatch(requestMakeRoiModelActive({ roiModelDto }));
  }
  deleteRoiModel(roiModelDto: RoiModelDto)
  {
    return this.store.dispatch(deleteRoiModel({ roiModelDto }));
  }


  processCurrentInformationForm(currentInformationForm: CurrentInformationForm): void
  {
    this.store.dispatch(processCurrentInformationForm({ currentInformationForm }));
  }
  processCareerGoalForm(careerGoalForm: CareerGoalForm): void
  {
    this.store.dispatch(processCareerGoalForm({ careerGoalForm }));
  }
  processEducationCostForm(educationCostForm: EducationCostForm): void
  {
    this.store.dispatch(processEducationCostForm({ educationCostForm }));
  }
  processEducationFinancingForm(educationFinancingForm: EducationFinancingDto): void
  {
    this.store.dispatch(processEducationFinancingForm({ educationFinancingForm }));
  }


  getActiveRoiModelDto$(): Observable<RoiModelDto>
  {
    return this.store.pipe(select(getActiveRoiModelDto));
  }
  getActiveUserModelDto$(): Observable<UserModelDto>
  {
    return this.store.pipe(select(getActiveUserModelDto));
  }
  getSelectedRoiModelId$(): Observable<string>
  {
    return this.store.pipe(select(getSelectedRoiModelId));
  }
  getRoiModelList$(): Observable<RoiModelDto[]>
  {
    return this.roiModelService.roiModelList$;
  }
  getRoiModelCount$(): Observable<number>
  {
    return this.roiModelService.roiModelCount$;
  }

  /* #endregion */
}
