import { RoiModelDto, UserModelDto } from '@app/domain';
import { RoiAggregateCardModel } from '@gql';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { CollectionFilterEnum, ROI_COLLECTION_STORE_FEATURE_KEY, RoiCollectionState, selectAll, selectTotal } from './state';


// RETRIEVE SLICE OF STATE
export const roiCollectionStoreSlice: MemoizedSelector<object, RoiCollectionState> = createFeatureSelector<RoiCollectionState>(ROI_COLLECTION_STORE_FEATURE_KEY);


export const getCollectionList: MemoizedSelector<object, RoiAggregateCardModel[]> = createSelector
  (
    roiCollectionStoreSlice,
    selectAll
  );


export const getActiveRoiAggregateId: MemoizedSelector<object, string> = createSelector
  (
    roiCollectionStoreSlice,
    (state): string => state.activeRoiAggregateId
  );
export const getActiveRoiModelDto: MemoizedSelector<object, RoiModelDto> = createSelector
  (
    roiCollectionStoreSlice,
    (state): RoiModelDto => state.activeRoiModelDto
  );
export const getActiveRoiModelHash: MemoizedSelector<object, string> = createSelector
  (
    roiCollectionStoreSlice,
    (state): string => state.activeRoiModelHash
  );
export const getActiveUserModelDto: MemoizedSelector<object, UserModelDto> = createSelector
  (
    roiCollectionStoreSlice,
    (state): UserModelDto => state.activeUserModelDto
  );
export const getSelectedRoiModelId: MemoizedSelector<object, string> = createSelector
  (
    getActiveRoiModelDto,
    (roiModelDto): string => roiModelDto?.roiModelId ?? ''
  );
export const getCollectionCount: MemoizedSelector<object, number> = createSelector
  (
    roiCollectionStoreSlice,
    selectTotal
  );
export const getCollectionFilterType: MemoizedSelector<object, CollectionFilterEnum> = createSelector
  (
    roiCollectionStoreSlice,
    (state): CollectionFilterEnum => state.collectionFilterType
  );
