import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

const getCognitoUser = (email: string) => new CognitoUser({ Username: email, Pool: userPool });

export const cognitoAuth = {
  signUp: (email: string, password: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const attributeList = [new CognitoUserAttribute({ Name: 'email', Value: email })];

      userPool.signUp(email, password, attributeList, [], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    }),

  confirmSignUp: (email: string, code: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const user = getCognitoUser(email);
      user.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    }),

  signIn: (email: string, password: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      const user = getCognitoUser(email);

      user.authenticateUser(authDetails, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: () => {
          reject(new Error('New password is required for this account.'));
        },
      });
    }),

  signOut: (): void => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
    }
  },

  getCurrentUser: () => userPool.getCurrentUser(),

  getAuthToken: (): Promise<string> =>
    new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (!user) {
        reject(new Error('No authenticated user'));
        return;
      }

      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session?.isValid()) {
          reject(new Error('Session is invalid'));
          return;
        }

        const token = session.getIdToken().getJwtToken();
        if (!token) {
          reject(new Error('Missing auth token'));
          return;
        }

        resolve(token);
      });
    }),
};
