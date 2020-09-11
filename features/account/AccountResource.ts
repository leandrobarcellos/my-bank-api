import * as express from 'express';
import {Router} from 'express';
import {Account} from "./Account";
import {AccountService} from "./AccountService";

/**
 * A atividade consiste em implementar os endpoints descritos abaixo no projeto “my-bank-api”
 * criado na Atividade Prévia. Eles serão relativos ao recurso “account”, que corresponde à
 * conta bancária de uma pessoa. Uma “account” possui os seguintes campos:
 *
 * - id (int): identificador único da conta.Deve ser gerado automaticamente pela API, e garantido que não se repita.
 * - name (string): nome do dono da conta.
 * - balance (float): saldo da conta.
 */
export class AccountResource {

    private readonly path = '/accounts';
    private readonly _router: Router = express.Router();
    private readonly service: AccountService = new AccountService();

    constructor() {
        this.intializeRoutes();
    }

    get router(): Router {
        return this._router;
    }

    /**
     * Crie um endpoint para criar uma “account”. Este endpoint deverá receber como parâmetros os campos
     * “name” e “balance” conforme descritos acima. O “balance” recebido neste endpoint corresponderá ao
     * saldo inicial da conta. Esta “account” deverá ser salva em um arquivo no formato json chamado
     * “accounts.json”, e deverá ter um “id” único associado. A API deverá garantir o incremento
     * automático deste identificador, de forma que ele não se repita entre os registros.
     *
     * @param request
     * @param response
     */
    createAccount = (request: express.Request, response: express.Response) => {
        const account: Account = request.body;
        this.service.createAccount(account);
        response.send(account);
    }

    /**
     * Crie um endpoint para registrar um depósito em uma conta. Este endpoint deverá receber como parâmetros
     * o id da conta e o valor do depósito. Ele deverá atualizar o “balance” da conta, incrementando-o com o
     * valor recebido como parâmetro e realizar a atualização no “accounts.json”. O endpoint deverá validar
     * se a conta informada existe, caso não exista deverá retornar um erro.
     *
     * @param request
     * @param response
     */
    patchAccountDeposit = (request: express.Request, response: express.Response) => {
        this.operateAccount(request, response, (accountId: number) => {
            try {
                this.service.makeDeposit(accountId, Number(request.body.depositAmmount));
                response.sendStatus(200);
            } catch (e) {
                this.sendError(e, response);
            }
        })
    }

    /**
     * Crie um endpoint para registrar um saque em uma conta. Este endpoint deverá receber como parâmetros
     * o id da conta e o valor do saque. Ele deverá atualizar o “balance” da conta, decrementando-o com o
     * valor recebido com parâmetro e realizar a atualização no “accounts.json”. O endpoint deverá validar
     * se a conta informada existe. Caso não exista, deverá retornar um erro. Também deverá validar se a
     * conta possui saldo suficiente para aquele saque, se não tiver deverá retornar um erro, não
     * permitindo assim que o saque fique negativo.
     *
     * @param request
     * @param response
     */
    patchAccountWithDraws = (request: express.Request, response: express.Response) => {
        this.operateAccount(request, response, (accountId: number) => {
            try {
                this.service.makeWithdraw(accountId, Number(request.body.withdrawAmmount));
                response.sendStatus(200);
            } catch (e) {
                this.sendError(e, response);
            }
        });
    }

    /**
     * Crie um endpoint para consultar o saldo da conta. Este endpoint deverá receber como parâmetro
     * o id da conta e deverá retornar seu “balance”. Caso a conta informada não exista, retornar
     * um erro.
     *
     * @param request
     * @param response
     */
    getAccountBalance = (request: express.Request, response: express.Response) => {
        this.operateAccount(request, response, (accountId: number) => {
            try {
                response.send({balance: this.service.getBalance(accountId)});
            } catch (e) {
                this.sendError(e, response);
            }
        });
    }

    /**
     * Crie um endpoint para excluir uma conta. Este endpoint deverá receber como parâmetro
     * o id da conta e realizar sua exclusão do arquivo “accounts.json”.
     * @param request
     * @param response
     */
    deleteAccount = (request: express.Request, response: express.Response) => {
        this.operateAccount(request, response, (accountId: number) => {
            this.service.deleteAccount(accountId);
            response.sendStatus(200);
        });
    }

    getAccount = (request: express.Request, response: express.Response) => {
        this.operateAccount(request, response, (accountId: number) => {
            try {
                response.send(this.service.findById(accountId));
            } catch (e) {
                this.sendError(e, response);
            }
        });
    }

    private intializeRoutes(): void {
        this._router.post(this.path, this.createAccount);
        this._router.patch(`${this.path}/:accountId/deposits`, this.patchAccountDeposit);
        this._router.patch(`${this.path}/:accountId/withdraws`, this.patchAccountWithDraws);
        this._router.get(`${this.path}/:accountId`, this.getAccount);
        this._router.get(`${this.path}/:accountId/balance`, this.getAccountBalance);
        this._router.delete(`${this.path}/:accountId`, this.deleteAccount);
    }

    private sendError(e: any, response: express.Response) {
        if (Number.isNaN(e) || e >= 600 || e < 100) {
            response.sendStatus(500);
        } else {
            response.sendStatus(e);
        }
    }

    private extractAccountIdFromPath(request: express.Request, response: express.Response): number {
        let accountId = -1;
        try {
            accountId = Number(request.params.accountId);
        } catch (e) {
            response.sendStatus(404);
        }
        return accountId;
    }

    private operateAccount(req: express.Request, res: express.Response,
                           operate: (accountId: number) => void): void {
        let accountId = this.extractAccountIdFromPath(req, res);
        if (Number.isNaN(accountId)) {
            res.sendStatus(404);
        } else {
            operate(accountId);
        }
    }

}
