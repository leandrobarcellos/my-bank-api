export interface Account {
    id?: number;
    name: string;
    balance: number;
}

export interface AccountDB {
    sequence: number,
    accounts: Account[]
}
