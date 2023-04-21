import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

// nome da função deve ser o mesmo da definição handler da stack, que no caso é handler

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    //context: identifica as propriedades da execução da função lambda

    const lambdaRequestId = context.awsRequestId    //identifica a execução da funcção lambda
    const apiRequestId = event.requestContext.requestId //número que identifica a requisição que entrou pelo APIGateway

    //o log abaixo vai aparecer no servico de cloud watch <---- Geração de logs gera custos ---->
    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda Request: ${lambdaRequestId}`)

    const method = event.httpMethod
    if (event.resource === "/products") {   //recurso invocado pelo usuário
        if (method === 'GET') {             //verbo da requisição
            console.log('GET')

            //  Retorno após acessar a rota
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "GET /products - OK"
                })
            }
        }
    } else if (event.resource === '/products/{id}') {
        const productId = event.pathParameters!.id as String    //Significa que o parametro pode ser nulo(!) ou id
        console.log(`GET /products/${productId}`)

        //  Retorno após acessar a rota
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `GET /products/${productId} - OK`
            })
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad request"
        })
    }
}