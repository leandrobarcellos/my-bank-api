import {Account} from "./Account";
import {AccountRepository} from "./AccountRepository";

export class AccountService {

    private repo: AccountRepository;

    constructor() {
        this.repo = new AccountRepository();
    }

    public makeDeposit(accountId: number, depositAmmount: number) {
        if (Number.isNaN(depositAmmount)) {
            throw 400;
        }
        let account = this.repo.findById(accountId);
        account.balance += depositAmmount;
        this.repo.update(account);
    }

    public createAccount(account: Account): void {
        if (!account.name || Number.isNaN(account.balance) || account.balance < 0) {
            throw 400;
        }
        this.repo.save(account);
    }

    public makeWithdraw(accountId: number, withdrawAmmount: number): void {
        if (Number.isNaN(withdrawAmmount)) {
            throw 400;
        }
        let account = this.repo.findById(accountId);
        if (account.balance < withdrawAmmount) {
            throw 400;
        } else {
            let currBalance = account.balance - withdrawAmmount;
            account.balance = Number(currBalance.toFixed(2));
            this.repo.update(account);
        }
    }

    public getBalance(accountId: number): number {
        return this.repo.findById(accountId).balance;
    }

    public deleteAccount(accountId: number): void {
        this.repo.delete(accountId);
    }

    public findById(accountId: number): Account {
        return this.repo.findById(accountId);
    }
}