import { createReducer, on } from '@ngrx/store';

import {
  collectionReceivedFromDatastore,
  requestCollectionAllFromDatastore,
  requestCollectionBySearchTermFromDatastore,
  requestCollectionMostRecentFromDatastore,
  requestCollectionSharedFromFromDatastore,
  requestCollectionSharedWithFromDatastore,
  setActiveModelHash,
  setActiveModels,
  setActiveRoiAggregate,
  setCollectionFilterType,
} from './actions';
import { initialRoiCollectionState, roiCollectionAdapter } from './state';


export const reducer = createReducer
  (
    initialRoiCollectionState,

    on(
      requestCollectionAllFromDatastore,
      requestCollectionBySearchTermFromDatastore,
      requestCollectionMostRecentFromDatastore,
      requestCollectionSharedFromFromDatastore,
      requestCollectionSharedWithFromDatastore,
      (state) =>
      {
        return roiCollectionAdapter.removeAll({ ...state });
      }),

    on(collectionReceivedFromDatastore, (state, { list }) => roiCollectionAdapter.addMany(list ?? [], { ...state })),

    on(setActiveRoiAggregate, (state, { roiAggregateModel }) => (
      {
        ...state,
        activeRoiAggregateId: roiAggregateModel.roiAggregateId,
        activeRoiModelDto: null,
        activeRoiModelHash: null,
        activeUserModelDto: null
      })),

    on(setActiveModels, (state, { activeRoiDto }) => (
      {
        ...state,
        activeRoiModelDto: activeRoiDto.roiModelDto,
        activeUserModelDto: activeRoiDto.userModelDto
      })),

    on(setActiveModelHash, (state, { hash }) => (
      {
        ...state,
        activeRoiModelHash: hash
      })),

    on(setCollectionFilterType, (state, { collectionFilterEnum }) => ({ ...state, collectionFilterType: collectionFilterEnum }))

  );
