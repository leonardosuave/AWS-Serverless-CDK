import{ DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

//  Atributos que serão criados na tabela do dynamoDB
export interface Product {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string
}

export class ProductRepository {
    private ddbClient: DocumentClient   //  Toda instacia da função lambda tera seu client 
    private productsDdb: string         //  Não tera um nome fixo a tabela pq recebe por parâmetro (pode mudar o nome a tabela)
    
    constructor(ddbClient: DocumentClient, productsDdb: string) {
        this.ddbClient = ddbClient
        this.productsDdb = productsDdb
    }
}