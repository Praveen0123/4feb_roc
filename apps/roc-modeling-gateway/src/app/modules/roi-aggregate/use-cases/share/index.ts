import { RoiAggregateInput, RoiAggregateModel, ShareInput, UserProfile } from '@roc-modeling-gateway-models';
import { IUseCase, Result } from '@vantage-point/ddd-core';

import { Auth0UserRepoService, auth0UserRepoService } from '../../../user-profile/repos/auth0-repo.service';
import { RoiAggregateRepoService, roiAggregateRepoService } from '../../repos/roi-aggregate-repo.service';


export class ShareUseCase implements IUseCase<ShareInput, Promise<RoiAggregateModel>>
{

  private constructor
    (
      private repo: RoiAggregateRepoService,
      private userRepo: Auth0UserRepoService
    )
  {
  }


  public static create(repo: RoiAggregateRepoService, userRepo: Auth0UserRepoService): ShareUseCase
  {
    return new ShareUseCase(repo, userRepo);
  }

  async executeAsync(input: ShareInput): Promise<RoiAggregateModel>
  {
    const userProfileOrError: Result<UserProfile> = await this.userRepo.getOrCreateUserForSharingModel(input);

    // SUCCESS
    if (userProfileOrError.isSuccess)
    {
      const userProfile: UserProfile = userProfileOrError.getValue();

      // SAVE SHARE ASSIGNMENT
      await this.repo.saveShare(input, userProfile);

      // SAVE ROI AGGREGATE TO SHARE WITH USER
      const roiAggregateInput: RoiAggregateInput =
      {
        tenantId: input.tenantId,
        userId: userProfile.id,
        roiAggregateId: input.roiAggregateId,
        roiAggregateName: input.roiAggregateName,
        roiAggregate: input.roiAggregate
      };

      const roiAggregateOrError: Result<RoiAggregateModel> = await this.repo.saveRoiAggregate(roiAggregateInput);

      if (roiAggregateOrError.isSuccess)
      {
        return roiAggregateOrError.getValue();
      }

      // FAILURE
      throw roiAggregateOrError.getError();
    }

    // FAILURE
    throw userProfileOrError.getError();
  }
}

export const shareUseCase: ShareUseCase = ShareUseCase.create(roiAggregateRepoService, auth0UserRepoService);
