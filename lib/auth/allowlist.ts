export interface SignInEvalArgs {
  profile: { id?: number; login?: string; name?: string | null };
  bootstrapLogin: string | undefined;
  userExists: (githubId: number) => Promise<boolean>;
  userCount: () => Promise<number>;
  bootstrap: (args: { githubId: number; githubLogin: string; displayName: string }) => Promise<void>;
}

export async function evaluateSignIn(args: SignInEvalArgs): Promise<boolean> {
  const { profile, bootstrapLogin, userExists, userCount, bootstrap } = args;
  if (!profile.id || !profile.login) return false;
  if (await userExists(profile.id)) return true;
  if ((await userCount()) === 0 && bootstrapLogin && profile.login === bootstrapLogin) {
    await bootstrap({ githubId: profile.id, githubLogin: profile.login, displayName: profile.name ?? profile.login });
    return true;
  }
  return false;
}
