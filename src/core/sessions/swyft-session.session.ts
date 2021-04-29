export class SwyftSession {
  public accountsInSession = [];

  /**
   * Kill a given session / Remove a given id from the session storage
   * @param accountId The id to be reomoved
   * @returns
   */
  public killSession = (accountId: string): any => {
    const foundSession = this.isInSession(accountId);

    return !foundSession.status
      ? false
      : this.accountsInSession.splice(foundSession.index, 1);
  };

  /**
   * Add account to the session storage
   * @param accountId The id to be added
   * @returns
   */
  public initSession = (accountId: string): number => {
    return this.accountsInSession.push(accountId);
  };

  /**
   * Check if a given account is in session
   * @param accountId The id to check
   * @returns
   */
  public isInSession = (
    accountId: string
  ): { index: number; status: boolean; id: string } => {
    const foundSession = this.accountsInSession.indexOf(accountId);
    return foundSession >= 0
      ? { index: foundSession, status: true, id: accountId }
      : { index: foundSession, status: false, id: accountId };
  };
}
