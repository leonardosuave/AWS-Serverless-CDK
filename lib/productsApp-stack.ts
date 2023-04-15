import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"

export class ProductsAppStack extends cdk.Stack {
    //scope: todo o projeto do cdk (app)
    //id: nome da stack

    //Handler: nome dado a função lambda quando invocada
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
    
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

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
        })
    }
}