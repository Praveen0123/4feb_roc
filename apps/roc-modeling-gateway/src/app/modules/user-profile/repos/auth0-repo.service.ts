import { ShareInput, UserProfile, UserProfileInput } from '@roc-modeling-gateway-models';
import { Result } from '@vantage-point/ddd-core';

import { CONFIG } from '../../../config/config';
import { Auth0Manager } from '../../../core/auth0-manager';
import { UserProfileError } from '../errors';
import { UserProfileRepoService, userProfileRepoService } from './user-profile-repo.service';

const got = require('got');

export class Auth0UserRepoService extends Auth0Manager
{

  private constructor(private repo: UserProfileRepoService)
  {
    super();
  }

  static create(repo: UserProfileRepoService): Auth0UserRepoService
  {
    return new Auth0UserRepoService(repo);
  }

  async getAuth0UserId(emailAddress: string): Promise<Result<string>>
  {
    try
    {
      const url: string = `${CONFIG.AUTH0.API_USERS}?q=${emailAddress}`;

      const { body } = await got.get(url,
        {
          headers: { authorization: super.auth0Token.token },
          responseType: 'json'
        });

      if (body && body.length > 0)
      {
        return Result.success<string>(body[0].user_id);
      }

      throw (`Auth0 user (${emailAddress}) does not exist`);
    }
    catch (err)
    {
      const message = `ERROR | CREATE AUHT0: ${err.message}`;
      const error: UserProfileError = new UserProfileError(message);

      return Result.failure<string>(error);
    }
  }

  async createAuth0User(input: ShareInput): Promise<Result<string>>
  {
    try
    {
      const url: string = `${CONFIG.AUTH0.API_USERS}`;

      const { body } = await got.post(url,
        {
          headers: { authorization: super.auth0Token.token },
          json:
          {
            "email": input.emailAddress,
            "given_name": input.firstName,
            "family_name": input.lastName,
            "name": `${input.firstName} ${input.lastName}`,
            "connection": "email"
          },
          responseType: 'json'
        });

      if (body.user_id)
      {
        return Result.success<string>(body.user_id);
      }

      throw (`Failed to create Autth0 user`);
    }
    catch (err)
    {
      const message = `ERROR | CREATE AUHT0: ${err.message}`;
      const error: UserProfileError = new UserProfileError(message);

      return Result.failure<string>(error);
    }
  }

  async getOrCreateUserForSharingModel(input: ShareInput): Promise<Result<UserProfile>>
  {
    try
    {
      let auth0UserId: string = undefined;
      const auth0UserIdOrError: Result<string> = await this.getAuth0UserId(input.emailAddress);

      // GET OR CREATE AUTH0 USER
      if (auth0UserIdOrError.isSuccess)
      {
        auth0UserId = auth0UserIdOrError.getValue();
      }
      else
      {
        const createAuth0UserOrError: Result<string> = await this.createAuth0User(input);

        if (createAuth0UserOrError.isSuccess)
        {
          auth0UserId = createAuth0UserOrError.getValue();
        }
        else
        {
          throw ('Could not find/create AUTH0 user');
        }
      }

      // GET OR CREATE USER FROM DATA STORE
      const userProfileInput: UserProfileInput =
      {
        id: auth0UserId,
        emailAddress: input.emailAddress,
        firstName: input.firstName,
        lastName: input.lastName,
        userType: input.userType,
        highSchoolId: null,
        hasCompletedOnboarding: false
      };

      const userProfileOrError: Result<UserProfile> = await this.repo.getUserByIdOrDefault(auth0UserId, userProfileInput);

      if (userProfileOrError.isSuccess)
      {
        return Result.success<UserProfile>(userProfileOrError.getValue());
      }

      throw ('Get or Create User failed');
    }
    catch (error)
    {
      return Result.failure<UserProfile>(error);
    }
  }

}


export const auth0UserRepoService: Auth0UserRepoService = Auth0UserRepoService.create(userProfileRepoService);
