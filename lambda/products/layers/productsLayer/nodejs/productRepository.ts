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

    async getAllProducts(): Promise<Product[]> {
        const data = await this.ddbClient.scan({
            TableName: this.productsDdb
        }).promise()
        return data.Items as Product[]
    }

    async getProductById(productId: string): Promise<Product> {
        const data = await this.ddbClient.get({
            TableName: this.productsDdb,
            Key: {
                id: productId
            }
        }).promise()
        if (data.Item) {
            return data.Item as Product
        } else {
            throw new Error("Product not found")
        }
    }

    async create(product : Product): Promise<Product> {
       if (!product.id) product.id = uuid();
       this.ddbClient.put({
            TableName: this.productsDdb,
            Item: product
       }).promise()
       return product
    }

    async deleteProduct(productId: string): Promise<Product> {
        const data = await this.ddbClient.delete({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ReturnValues: "ALL_OLD" //  Por padrão não retorna nada. - ALL_OLD retorna o dado antigo(modificado, deletado) e capturado no retorno por Attributes
        }).promise()

        if (data.Attributes) {
            return data.Attributes as Product
        } else {
            throw new Error('Product not found')
        }
    }

    async updateProduct(productId: string, product: Product): Promise<Product> {
        const data = await this.ddbClient.update({
            TableName: this.productsDdb,
            Key: {
                id: productId
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: 'UPDATED_NEW',    //Vai retornar o registro atualizado na posição de data.Attributes
            UpdateExpression: "Set productName = :n, code = :c, price = :p, model = :m",
            ExpressionAttributeValues: {
                ":n": product.productName,
                ":c": product.code,
                ":p": product.price,
                ":m": product.model
            }
        }).promise()

        data.Attributes!.id = productId
        return data.Attributes as Product;
    }
}