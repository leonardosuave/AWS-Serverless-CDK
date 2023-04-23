import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";  //  Importa direto através do path inserido no tsconfig.json
import { DynamoDB } from "aws-sdk"

// <-- IMPORT DATA TO USE DYNAMODB ON PRODUCTS TABLE -->
const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)

// Nome da função deve ser o mesmo da definição handler da stack, que no caso é handler
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    //context: identifica as propriedades da execução da função lambda

    const lambdaRequestId = context.awsRequestId            //  Identifica a execução da funcao lambda
    const apiRequestId = event.requestContext.requestId     //  Numero que identifica a requisição que entrou pelo APIGateway

    //Cloud watch
    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda Request: ${lambdaRequestId}`)

    if (event.resource === "/products") {
        if (event.httpMethod === 'POST') {                                  //  Não é necessário ja que nessa função existe apenas POST para /products
            console.log('POST /products')

            const product = JSON.parse(event.body!) as Product              //  Método para capturar o body da request - Product importado do productsLayer
            const productCreated = await productRepository.create(product)

            //  Retorno após acessar a rota
            return {
                statusCode: 201,
                body: JSON.stringify(productCreated)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string                //  Pode ser nulo ou não (!.)
        if (event.httpMethod === 'PUT') {
            console.log(`PUT /products/${productId}`)

            try {
                const product = JSON.parse(event.body!) as Product
                const productUpdated = await productRepository.updateProduct(productId, product)
    
                return {
                    statusCode: 204,
                    body: JSON.stringify(productUpdated)
                }
            } catch(ConditionCheckFailedException) {                        //  O erro passa a ser esse pq o parametro de busca do banco tem ConditionExpression
                return {
                    statusCode: 404,
                    body: 'Product not found'
                }
            }

        } else if (event.httpMethod === 'DELETE') {
            console.log(`DELETE /products/${productId}`)

            try {
                const product = await productRepository.deleteProduct(productId)

                return {
                    statusCode: 200,
                    body: JSON.stringify(product)
                }
            } catch (e) {
                console.error((<Error>e).message)
                return {
                    statusCode: 404,
                    body: (<Error>e).message
                }
            }
        }
    }

    //Padrão error (sempre necessário)
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad request"
        })
    }
}