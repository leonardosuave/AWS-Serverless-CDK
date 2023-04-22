import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as ssm from "aws-cdk-lib/aws-ssm"

export class ProductsAppStack extends cdk.Stack {
    //scope: todo o projeto do cdk (app)
    //id: nome da stack

    //  Handler: nome dado a função lambda quando invocada
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction

    //  Recurso lambda que acessa a tabela do banco de dados para executar operações
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction

    //  nome da função do banco de dados dynamoDB
    readonly productsDbd: dynamodb.Table
    
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        //  <-- CONFIGURAÇÃO DA TABELA DE PRODUTOS -->
        this.productsDbd = new dynamodb.Table(this, "ProductsDbd", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,   //  A tablea é excluida quando a stack é excluida (Não ideal)
            //  config da chave primaria
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,  //  modo de cobrança
            readCapacity: 1,    //  quantidade de requisição por segundo que a tabela pode receber
            writeCapacity: 1    //  mesma coisa que readCapacity
        })

        //  <-- Products layer -->
        const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn")               //  Resgata a versão do layer armazenado no parametro
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn)    //  Onde a função vai buscar trecho de codigo do layer resgatado acima

        this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsFetchFunction", {
            functionName: "ProductsFetchFunction", // nome da função que aparece no console da AWS
            entry: "lambda/products/productsFetchFunctions.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5), // 5 segundos
            bundling: {
                minify: true, // permite que o codigo seja enxuto através da eliminação de quebra de linhas e outras coisas e fique menor o arquivo
                sourceMap: false // desliga a geração de mapas pra debugs, ficando menor o arquivo
            },
            environment: {
                PRODUCTS_DDB: this.productsDbd.tableName, // captura o nome da tabela que a funcao acessa
            },
            layers: [productsLayer] //  A função pode buscar código no layer especificado
        })
        this.productsDbd.grantReadData(this.productsFetchHandler) //Limita acesso apenas de leitura da tabela products pela função fetch

        this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsAdminFunction", {
            functionName: "ProductsAdminFunction", // nome da função que aparece no console da AWS
            entry: "lambda/products/ProductsAdminFunction.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5), // 5 segundos
            bundling: {
                minify: true, // permite que o codigo seja enxuto através da eliminação de quebra de linhas e outras coisas e fique menor o arquivo
                sourceMap: false // desliga a geração de mapas pra debugs, ficando menor o arquivo
            },
            environment: {
                PRODUCTS_DDB: this.productsDbd.tableName // captura o nome da tabela que a funcao acessa
            },
            layers: [productsLayer] //  A função pode buscar código no layer especificado
        })
        this.productsDbd.grantWriteData(this.productsAdminHandler)  //Limita acesso de escrita na tabela products pela função admin
    }
}