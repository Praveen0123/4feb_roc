import { Injectable } from '@angular/core';
import { CONFIG } from '@app/config/config';
import { CareerGoalForm, CurrentInformationForm, EducationCostForm } from '@app/core/models';
import { NavigationService } from '@app/core/services';
import { NotificationService } from '@app/core/services/notification/notification.service';
import { ActiveRoiDto, CareerGoalDto, CurrentInformationDto, EducationCostDto, RoiModelService, RoiModelToSaveDto } from '@app/domain';
import {
  ExchangeAutoCompleteForLocationGQL,
  ExchangeAutoCompleteForOccupationGQL,
  GetRoiAggregateGQL,
  GetRoiAggregateListAllGQL,
  GetRoiAggregateListBySearchTermGQL,
  GetRoiAggregateListMostRecentGQL,
  GetRoiAggregateListSharedFromGQL,
  GetRoiAggregateListSharedWithGQL,
  GetRoiAggregateMostRecentGQL,
  InstitutionByUnitIdGQL,
  InstructionalProgramGQL,
  RoiAggregateInput,
  SaveRoiAggregateGQL,
  ShareAggregateGQL,
  ShareInput,
  Tenant,
  UserProfile,
} from '@gql';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AutoCompleteModel } from '@vantage-point/auto-complete-textbox';
import { UseCaseError } from '@vantage-point/ddd-core';
import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { determineActiveAccordionPanel } from '../accordion/actions';
import { selectTenant } from '../tenant/selectors';
import { getUserProfile } from '../user/selectors';
import {
  cloneRoiModel,
  collectionReceivedFromDatastore,
  createNewAggregate,
  createNewRoiModel,
  deleteRoiModel,
  processCareerGoalForm,
  processCurrentInformationForm,
  processEducationCostForm,
  processEducationFinancingForm,
  renameAggregate,
  renameModel,
  requestActiveModels,
  requestCollectionAllFromDatastore,
  requestCollectionBySearchTermFromDatastore,
  requestCollectionMostRecentFromDatastore,
  requestCollectionSharedFromFromDatastore,
  requestCollectionSharedWithFromDatastore,
  requestMakeRoiModelActive,
  requestMostRecentAggregate,
  requestRoiAggregateFromSearchPage,
  resetAggregate,
  roiAggregateFromSearchPageReceived,
  roiCollectionErrorHappened,
  saveRoiAggregateToDataStore,
  setActiveModelHash,
  setActiveModels,
  setActiveRoiAggregate,
  setCollectionFilterType,
  shareRoiAggregate,
} from './actions';
import { getActiveRoiModelDto, getActiveRoiModelHash } from './selectors';
import { CollectionFilterEnum } from './state';


@Injectable()
export class RoiModelStoreEffects
{

  constructor
    (
      private store: Store,
      private actions$: Actions,
      private exchangeAutoCompleteForLocationGQL: ExchangeAutoCompleteForLocationGQL,
      private exchangeAutoCompleteForOccupationGQL: ExchangeAutoCompleteForOccupationGQL,
      private instructionalProgramGQL: InstructionalProgramGQL,
      private institutionByUnitIdGQL: InstitutionByUnitIdGQL,
      private getRoiAggregateGQL: GetRoiAggregateGQL,
      private getRoiAggregateMostRecentGQL: GetRoiAggregateMostRecentGQL,
      private getRoiAggregateListAllGQL: GetRoiAggregateListAllGQL,
      private getRoiAggregateListBySearchTermGQL: GetRoiAggregateListBySearchTermGQL,
      private getRoiAggregateListMostRecentGQL: GetRoiAggregateListMostRecentGQL,
      private getRoiAggregateListSharedFromGQL: GetRoiAggregateListSharedFromGQL,
      private getRoiAggregateListSharedWithGQL: GetRoiAggregateListSharedWithGQL,
      private saveRoiAggregateGQL: SaveRoiAggregateGQL,
      private shareAggregateGQL: ShareAggregateGQL,
      private roiModelService: RoiModelService,
      private navigationService: NavigationService,
      private notificationService: NotificationService
    )
  {
  }




  /* #region  COLLECTION ACTIONS */

  requestCollectionAllFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionAllFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListAllGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListAll }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.ALL })
              ])
          );
      })
    ));

  requestCollectionBySearchTermFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionBySearchTermFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([action, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListBySearchTermGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              searchTerm: action.searchTerm
            }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListBySearchTerm }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.BY_SEARCH_TERM })
              ])
          );
      })
    ));

  requestCollectionMostRecentFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionMostRecentFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListMostRecentGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListMostRecent }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.MOST_RECENT })
              ])
          );
      })
    ));

  requestCollectionSharedFromFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionSharedFromFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListSharedFromGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListSharedFrom }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.SHARED_FROM })
              ])
          );
      })
    ));

  requestCollectionSharedWithFromDatastore$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestCollectionSharedWithFromDatastore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([_, tenant, userProfile]) =>
      {
        return this.getRoiAggregateListSharedWithGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id
            }
          )
          .pipe
          (
            switchMap((results) =>
              [
                collectionReceivedFromDatastore({ list: results.data.getRoiAggregateListSharedWith }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.SHARED_WITH })
              ])
          );
      })
    ));

  /* #endregion */






  /* #region  ROI AGGREGATE ACTIONS */

  requestMostRecentAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestMostRecentAggregate),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getActiveRoiModelDto))
            )
        )),
      filter(([_, activeRoiModelDto]) =>
      {
        if (activeRoiModelDto)
        {
          return false;
        }

        return true;
      }),
      switchMap(() => this.roiModelService.getDefaultAggregateToSaveModel()),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([defaultRoiModelToSaveDto, tenant, userProfile]) =>
      {
        // console.log('WHO DAT | defaultRoiAggregate', roiModelToSaveDto);
        // console.log('WHO DAT | tenant', tenant);
        // console.log('WHO DAT | userProfile', userProfile);

        const defaultRoiAggregate: RoiAggregateInput =
        {
          tenantId: tenant.id,
          userId: userProfile.id,
          roiAggregateId: defaultRoiModelToSaveDto.roiAggregateId,
          roiAggregateName: defaultRoiModelToSaveDto.name,
          roiAggregate: defaultRoiModelToSaveDto
        };

        return this.getRoiAggregateMostRecentGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              defaultRoiAggregate: defaultRoiAggregate
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('WHO DAT', results.data.getRoiAggregateList);

              return [
                setActiveRoiAggregate({ roiAggregateModel: results.data.getRoiAggregateMostRecent }),
                setCollectionFilterType({ collectionFilterEnum: CollectionFilterEnum.MOST_RECENT })
              ];
            })
          );
      })
    ));

  setActiveRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveRoiAggregate),
      concatMap((action) => this.roiModelService.fromSaveModelToAggregate(action.roiAggregateModel.roiAggregate)),
      map(() => requestActiveModels())
    ));
  requestRoiAggregateFromSearchPage$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestRoiAggregateFromSearchPage),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      switchMap(([action, tenant, userProfile]) =>
      {
        return this.getRoiAggregateGQL
          .fetch(
            {
              tenantId: tenant.id,
              userId: userProfile.id,
              roiAggregateId: action.roiAggregateCardModel.roiAggregateId
            }
          )
          .pipe
          (
            switchMap((results) => [
              setActiveRoiAggregate({ roiAggregateModel: results.data.getRoiAggregate }),
              roiAggregateFromSearchPageReceived()
            ])
          );
      })
    ));
  roiAggregateFromSearchPageReceived$ = createEffect(() => this.actions$.pipe
    (
      ofType(roiAggregateFromSearchPageReceived),
      tap(() => this.navigationService.goToModelingPage())
    ), { dispatch: false });


  saveRoiAggregateToDataStore$ = createEffect(() => this.actions$.pipe
    (
      ofType(saveRoiAggregateToDataStore),
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),
      concatMap(([action, tenant, userProfile]) =>
      {
        return forkJoin
          (
            [
              of(action),
              of(tenant),
              of(userProfile),
              this.roiModelService.fromAggregateToSaveModel()
            ]
          );
      }),
      switchMap((results) =>
      {
        const action = results[0];
        const tenant: Tenant = results[1];
        const userProfile: UserProfile = results[2];
        const roiModelToSaveDto: RoiModelToSaveDto = results[3];

        const roiAggregateInput: RoiAggregateInput =
        {
          tenantId: tenant.id,
          userId: userProfile.id,
          roiAggregateId: roiModelToSaveDto.roiAggregateId,
          roiAggregateName: roiModelToSaveDto.name,
          roiAggregate: roiModelToSaveDto
        };

        // console.log('TO BE SAVED:', roiAggregateInput);

        return this.saveRoiAggregateGQL
          .mutate({ roiAggregateInput }, CONFIG.API.SILENT_REQUEST)
          .pipe
          (
            map(() => setActiveModelHash({ hash: action.hash }))
          );
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'SAVE ROI AGGREGATE') })))
    ));


  renameAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(renameAggregate),
      concatMap((action) => this.roiModelService.renameAggregate(action.name)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI AGGREGATE') })))
    ));


  shareRoiAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(shareRoiAggregate),

      // RETRIEVE LATEST TENANT AND LOGGED IN USER
      withLatestFrom
        (
          this.store.pipe(select(selectTenant)),
          this.store.pipe(select(getUserProfile))
        ),

      // COMBINE ACTION (SHARED WITH DATA), LATEST TENANT AND LOGGED IN USER, PLUS AGGREGATE AS SAVED MODEL
      switchMap(([action, tenant, userProfile]) =>
      {
        return forkJoin
          (
            [
              of(action),
              of(tenant),
              of(userProfile),
              this.roiModelService.fromAggregateToSaveModel()
            ]
          );
      }),

      // BUILD SHARE MODEL AND SEND TO BACKEND & SHOW SUCCESS MESSAGE
      switchMap((results) =>
      {
        const action = results[0];
        const tenant: Tenant = results[1];
        const userProfile: UserProfile = results[2];
        const roiModelToSaveDto: RoiModelToSaveDto = results[3];

        const shareInput: ShareInput =
        {
          tenantId: tenant.id,
          sharedFromUserId: userProfile.id,
          firstName: action.shareRoiAggregateModel.firstName,
          lastName: action.shareRoiAggregateModel.lastName,
          emailAddress: action.shareRoiAggregateModel.emailAddress,
          userType: action.shareRoiAggregateModel.userType,
          roiAggregateId: roiModelToSaveDto.roiAggregateId,
          roiAggregateName: roiModelToSaveDto.name,
          roiAggregate: JSON.stringify(roiModelToSaveDto)
        };

        return this.shareAggregateGQL
          .mutate({ shareInput })
          .pipe
          (
            switchMap(() => this.notificationService.success('successfully shared model').afterDismissed())
          );
      }),

      // FINALLY, NAVIGATE USER BACK TO MODEL PAGE...
      tap(() => this.navigationService.goToModelingPage()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'SHARE ROI AGGREGATE') })))
    ), { dispatch: false });



  resetAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(resetAggregate),
      concatMap(() => this.roiModelService.resetAggregate()),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RESET ROI AGGREGATE') })))
    ));
  createNewAggregate$ = createEffect(() => this.actions$.pipe
    (
      ofType(createNewAggregate),
      concatMap(() => this.roiModelService.createNewAggregate()),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI AGGREGATE') })))
    ));

  /* #endregion */






  /* #region  ROI MODEL ACTIONS */

  requestActiveModels$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestActiveModels),
      concatMap(() => this.roiModelService.getActiveRoiModel()),
      map((activeRoiDto: ActiveRoiDto) => setActiveModels({ activeRoiDto: activeRoiDto })),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI MODEL') })))
    ));

  setActiveModels$ = createEffect(() => this.actions$.pipe
    (
      ofType(setActiveModels),
      concatMap(action => of(action).pipe
        (
          withLatestFrom
            (
              this.store.pipe(select(getActiveRoiModelHash))
            )
        )),
      map(([action, existingModelHash]) =>
      {
        const shouldSaveBeExecuted: boolean = (!existingModelHash) ? false : (action.activeRoiDto.roiModelDto.modelHash !== existingModelHash);
        // console.log('incoming model hash:', action.activeRoiDto.roiModelDto.modelHash);
        // console.log('existing model hash:', existingModelHash);
        // console.log('should Save Be Executed:', shouldSaveBeExecuted);

        if (shouldSaveBeExecuted)
        {
          return saveRoiAggregateToDataStore({ hash: action.activeRoiDto.roiModelDto.modelHash });
        }

        return setActiveModelHash({ hash: action.activeRoiDto.roiModelDto.modelHash });
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI AGGREGATE') })))
    ));




  createNewRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(createNewRoiModel),
      concatMap(() => this.roiModelService.createEmptyRoiModel(null)),
      switchMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CREATE NEW ROI MODEL') })))
    ));
  renameModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(renameModel),
      concatMap((action) => this.roiModelService.renameModel(action.name)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'RENAME ROI MODEL') })))
    ));
  cloneRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(cloneRoiModel),
      concatMap((action) => this.roiModelService.cloneRoiModel(action.dialogDataToKeepModel)),
      concatMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'CLONE ROI MODEL') })))
    ));
  requestMakeRoiModelActive$ = createEffect(() => this.actions$.pipe
    (
      ofType(requestMakeRoiModelActive),
      concatMap((action) => this.roiModelService.makeActive(action.roiModelDto)),
      switchMap(() =>
      {
        return [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ];
      }),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'MAKE ROI MODEL ACTIVE') })))
    ));
  deleteRoiModel$ = createEffect(() => this.actions$.pipe
    (
      ofType(deleteRoiModel),
      concatMap((action) => this.roiModelService.deleteRoiModel(action.roiModelDto)),
      switchMap(() =>
        [
          requestActiveModels(),
          determineActiveAccordionPanel()
        ]),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'DELETE ROI MODEL') })))
    ));



  processCurrentInformationForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processCurrentInformationForm),
      switchMap((action) =>
      {
        const formData: CurrentInformationForm = action.currentInformationForm;
        const location: AutoCompleteModel = formData?.currentLocation;
        const occupation: AutoCompleteModel = formData?.currentOccupation;

        // console.log('EFFECTS | CAREER GOAL FORM DATA', formData);

        /*
        RETRIEVE LOCATION AND OCCUPATION FROM BACKEND....
        */
        return forkJoin
          (
            {
              location: (location) ? this.exchangeAutoCompleteForLocationGQL.fetch({ autoCompleteModel: location }, CONFIG.API.SILENT_REQUEST) : of(null),
              occupation: (occupation) ? this.exchangeAutoCompleteForOccupationGQL.fetch({ autoCompleteModel: occupation }, CONFIG.API.SILENT_REQUEST) : of(null)
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('EFFECTS | RESULTS:', results);

              const currentInformation: CurrentInformationDto =
              {
                currentAge: formData.currentAge,
                occupation: (results.occupation) ? results.occupation.data.exchangeAutoCompleteForOccupation : null,
                location: (results.location) ? results.location.data.exchangeAutoCompleteForLocation : null,
                educationLevel: formData.educationLevel
              };

              return this.roiModelService.updateCurrentInformation(currentInformation);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS CURRENT INFORMATION FORM') })))
    ));
  processCareerGoalForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processCareerGoalForm),
      withLatestFrom(this.store.pipe(select(getActiveRoiModelDto))),
      switchMap(([action, activeRoiModel]) =>
      {
        const formData: CareerGoalForm = action.careerGoalForm;
        const location: AutoCompleteModel = formData?.location;
        const occupation: AutoCompleteModel = formData?.occupation;
        const cipCode: string = formData?.degreeProgram?.id;

        // console.log('EFFECTS | CAREER GOAL FORM DATA', formData);
        // console.log('EFFECTS | ACTIVE ROI MODEL', activeRoiModel);

        const hasLocationChanged: boolean = (formData.location?.id !== activeRoiModel.location?.zipCode);
        const hasOccupationChanged: boolean = (formData.occupation?.id !== activeRoiModel.occupation?.onetCode);
        const hasProgramChanged: boolean = (formData.degreeProgram?.id !== activeRoiModel.degreeProgram?.cipCode);

        // console.log('EFFECTS | hasLocationChanged', hasLocationChanged);
        // console.log('EFFECTS | hasOccupationChanged', hasOccupationChanged);
        // console.log('EFFECTS | hasProgramChanged', hasProgramChanged);

        /*
        RETRIEVE LOCATION AND OCCUPATION FROM BACKEND....
        */
        return forkJoin
          (
            {
              location: (location && hasLocationChanged) ? this.exchangeAutoCompleteForLocationGQL.fetch({ autoCompleteModel: location }, CONFIG.API.SILENT_REQUEST) : of(null),
              occupation: (occupation && hasOccupationChanged) ? this.exchangeAutoCompleteForOccupationGQL.fetch({ autoCompleteModel: occupation }, CONFIG.API.SILENT_REQUEST) : of(null),
              program: (cipCode && hasProgramChanged) ? this.instructionalProgramGQL.fetch({ cipCode: cipCode }, CONFIG.API.SILENT_REQUEST) : of(null)
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              // console.log('RESULTS', results);

              const careerGoal: CareerGoalDto =
              {
                location: (results.location) ? results.location.data.exchangeAutoCompleteForLocation : (!hasLocationChanged) ? activeRoiModel.location : null,
                occupation: (results.occupation) ? results.occupation.data.exchangeAutoCompleteForOccupation : (!hasOccupationChanged) ? activeRoiModel.occupation : null,
                degreeLevel: formData.degreeLevel,
                degreeProgram: (results.program) ? results.program.data.instructionalProgram : (!hasProgramChanged) ? activeRoiModel.degreeProgram : null,
                retirementAge: formData.retirementAge,
                careerGoalPathType: formData.careerGoalPathType
              };

              return this.roiModelService.updateCareerGoal(careerGoal);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS CAREER GOAL FORM') })))
    ));
  processEducationCostForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processEducationCostForm),
      switchMap((action) =>
      {
        const formData: EducationCostForm = action.educationCostForm;
        const institutionId: string = formData?.institution?.id;

        /*
        RETRIEVE INSTITUTION FROM BACKEND....
        */
        return forkJoin
          (
            {
              institution: (institutionId) ? this.institutionByUnitIdGQL.fetch({ unitId: institutionId }, CONFIG.API.SILENT_REQUEST) : of(null),
            }
          )
          .pipe
          (
            switchMap((results) =>
            {
              const educationCost: EducationCostDto =
              {
                institution: (results.institution) ? results.institution.data.institution : null,
                startYear: formData.startYear,
                incomeRange: formData.incomeRange,
                isFulltime: formData.isFulltime,
                yearsToCompleteDegree: formData.yearsToCompleteDegree
              };

              return this.roiModelService.updateEducationCost(educationCost);
            })
          );
      }),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS EDUCATION COST FORM') })))
    ));
  processEducationFinancingForm$ = createEffect(() => this.actions$.pipe
    (
      ofType(processEducationFinancingForm),
      switchMap((action) => this.roiModelService.updateEducationFinancing(action.educationFinancingForm)),
      map(() => requestActiveModels()),
      catchError((errorMessage) => of(roiCollectionErrorHappened({ useCaseError: this.createUseCaseError(errorMessage, 'PROCESS EDUCATION FINANCING FORM') })))
    ));

  /* #endregion */





  roiCollectionErrorHappened$ = createEffect(() => this.actions$.pipe
    (
      ofType(roiCollectionErrorHappened),
      map((action) => this.notificationService.error(action.useCaseError).afterDismissed())
    ), { dispatch: false });



  private createUseCaseError(message: string, errorType: string): UseCaseError
  {
    const useCaseError: UseCaseError =
    {
      message: message,
      error: null,
      errorType: errorType,
      details: null
    };

    return useCaseError;
  }

}
