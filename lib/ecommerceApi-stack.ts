//API GATEWAY
import * as cdk from "aws-cdk-lib"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"

//  Para não inserir o productsFetchHandler: lambdaNodeJS.NodejsFunction dentro do construtor e ficar algo repetitivo com outras stacks, cria-se uma interface que extends o cdk.StackProps e de dentro do construtor da classe torna-se obrigatório o props e referencia como esta interface criada
interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJS.NodejsFunction
}

export class ECommerceApiStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
        super(scope, id, props)

        //Para criar log no aws watch
        const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs")

        //apigateway.RestApi -> permite validações mais avanádas, como URI, body do request...
        const api = new apigateway.RestApi(this, "ECommerceApi", {
            restApiName: "ECommerceApi", // nome da função que aparece no console da AWS
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup), //Mostra onde o api gateway deve gerar os logs
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true, //Não adequado, informação de ip
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true //Não adequado, informação do usuário
                })
            }

        })

        //Integração do API gateway com a função lambda
        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)

        //  Forma que o api gateway invoca(integra) a função lambda ->
        //  1° criar recurso que representa o serviço de produtos
        const productsResource = api.root.addResource("products") // root contem o "/"

        //  2° criar o método de do recurso produtos
        //  Quando receber uma req /products com verbo GET vai chamar a integration, que invoca a função de stack de produtos, que sera invocado o método handler dentro do arquivo productsFetchFunctions.ts e lá dentro possui verificação para o verbo "GET"
        productsResource.addMethod("GET", productsFetchIntegration)
    }    
}