import {Account, AccountDB} from "./Account";
import fs from "fs";

export class AccountRepository {
    private accountsDB: AccountDB;

    constructor() {
        this.accountsDB = {
            sequence: 1,
            accounts: []
        }
        fs.readFile("accounts.json", (err, data) => {
            if (err) {
                throw err;
            }
            this.accountsDB = JSON.parse(data.toString());
        });
    }

    public findById(accountId?: number): Account {
        let find = this.accountsDB.accounts.find(a => a.id === accountId);
        if (!find) {
            throw 404;
        }
        return find;
    }

    public save(account: Account): void {
        let next = ++this.accountsDB.sequence;
        account.id = next;
        this.accountsDB.accounts.push(account);
        this.updateDB();
    }

    public update(account: Account): void {
        let found = this.findById(account.id);
        if (found) {
            this.remove(found);
            this.accountsDB.accounts.push(account);
            this.updateDB();
        }
    }

    public delete(accountId: number): void {
        try {
            let found = this.findById(accountId);
            this.remove(found);
            this.updateDB();
        } catch (e) {
            console.log("considerando excluído id não encontrado...");
        }
    }

    private updateDB(): void {
        let data = JSON.stringify(this.accountsDB);
        fs.writeFileSync("accounts.json", data);
    }

    private remove(found: Account) {
        let index = this.accountsDB.accounts.indexOf(found);
        if (index != 1) {
            this.accountsDB.accounts.splice(index, 1);
        }
    }
}