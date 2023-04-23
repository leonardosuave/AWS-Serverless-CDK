import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";  //  Importa direto através do path inserido no tsconfig.json
import { DynamoDB } from "aws-sdk"

// <-- IMPORT DATA TO USE DYNAMODB ON PRODUCTS TABLE -->
const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDdb)

// Nome da função deve ser o mesmo da definição handler da stack, que no caso é handler
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    //context: identifica as propriedades da execução da função lambda

    const lambdaRequestId = context.awsRequestId            //  Identifica a execução da funcção lambda
    const apiRequestId = event.requestContext.requestId     //  Número que identifica a requisição que entrou pelo APIGateway

    //O log abaixo vai aparecer no servico de cloud watch <---- Geração de logs gera custos ---->
    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda Request: ${lambdaRequestId}`)

    const method = event.httpMethod
    if (event.resource === "/products") {                   //  Recurso invocado pelo usuário
        if (method === 'GET') {                             //  Verbo da requisição
            console.log('GET /products')

            const products = await productRepository.getAllProducts()

            //  Retorno após acessar a rota
            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string    //  Significa que o parametro pode ser nulo(!) ou id
        console.log(`GET /products/${productId}`)

        try {
            const product = await productRepository.getProductById(productId)

            //  Retorno após acessar a rota
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

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad request"
        })
    }
}