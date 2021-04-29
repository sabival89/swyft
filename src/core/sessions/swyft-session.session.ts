export class SwyftSession {
  public accountsInSession = [];
  public id: string;

  /**
   *
   * @returns
   */
  public killSession = () => {
    const foundSession = this.isInSession(this.id);

    return !foundSession
      ? false
      : this.accountsInSession.splice(foundSession.index, 1);
  };

  /**
   *
   * @param accountId
   * @returns
   */
  public initSession = (accountId: string) => {
    this.id = accountId;
    return this.accountsInSession.push(this.id);
  };

  /**
   *
   * @param accountId
   * @returns
   */
  public isInSession = (accountId: string) => {
    const foundSession = this.accountsInSession.indexOf(accountId);
    return foundSession >= 0
      ? { index: foundSession, status: true, id: accountId }
      : { index: foundSession, status: false, id: accountId };
  };
}
