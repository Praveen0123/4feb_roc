import { RoiModelDto, UserModelDto } from '@app/domain';
import { RoiAggregateCardModel, UserType } from '@gql';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';


export const ROI_COLLECTION_STORE_FEATURE_KEY = 'roi-collection-store';

export enum CollectionFilterEnum
{
  ALL = 0,
  BY_SEARCH_TERM = 1,
  MOST_RECENT = 2,
  SHARED_FROM = 3,
  SHARED_WITH = 4
}

export interface ShareRoiAggregateModel
{
  firstName: string;
  lastName: string;
  emailAddress: string;
  userType: UserType;
}

export interface RoiCollectionState extends EntityState<RoiAggregateCardModel>
{
  activeRoiAggregateId: string;
  activeRoiModelDto: RoiModelDto;
  activeRoiModelHash: string;
  activeUserModelDto: UserModelDto;
  collectionFilterType: CollectionFilterEnum;
}

export const roiCollectionAdapter: EntityAdapter<RoiAggregateCardModel> = createEntityAdapter<RoiAggregateCardModel>
  (
    {
      selectId: (roiAggregateCardModel: RoiAggregateCardModel) => roiAggregateCardModel.roiAggregateId,
      sortComparer: false
    }
  );

export const initialRoiCollectionState: RoiCollectionState = roiCollectionAdapter.getInitialState
  (
    {
      activeRoiAggregateId: null,
      activeRoiModelDto: null,
      activeRoiModelHash: null,
      activeUserModelDto: null,
      collectionFilterType: CollectionFilterEnum.MOST_RECENT
    }
  );

export const
  {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
  } = roiCollectionAdapter.getSelectors();
