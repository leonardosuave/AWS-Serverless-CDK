import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

// nome da função deve ser o mesmo da definição handler da stack, que no caso é handler

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    //context: identifica as propriedades da execução da função lambda

    const lambdaRequestId = context.awsRequestId    //identifica a execução da funcao lambda
    const apiRequestId = event.requestContext.requestId //numero que identifica a requisição que entrou pelo APIGateway

    //cloud watch
    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda Request: ${lambdaRequestId}`)

    const method = event.httpMethod
    if (event.resource === "/products") {
        if (method === 'POST') {    //Não é necessário ja que nessa função existe apenas POST para /products
            console.log('POST /products')

            //  Retorno após acessar a rota
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: 'POST /products - OK'
                })
            }
        }
    } else if (event.resource === '/products/{id}') {
        const productId = event.pathParameters!.id as String    //Pode ser nulo ou não (!.)
        if (method === 'PUT') {
            console.log(`PUT /products/${productId}`)

            return {
                statusCode: 204,
                body: JSON.stringify({
                    message: `PUT /products/${productId}`
                })
            }
        } else if (method === 'DELETE') {
            console.log(`DELETE /products/${productId}`)

            return {
                statusCode: 204,
                body: JSON.stringify({
                    message: `DELETE /products/${productId}`
                })
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