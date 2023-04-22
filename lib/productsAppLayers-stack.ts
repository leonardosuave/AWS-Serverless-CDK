//  Função que compartilha codigo com as funções lambda Fetch e Admin
//  Reduz a quantidade de código e melhora performace

import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as ssm from "aws-cdk-lib/aws-ssm"                                          //Para guardar parametros dentro da aws

export class ProductsAppLayersStack extends cdk.Stack {
    readonly productsLayers: lambda.LayerVersion

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.productsLayers = new lambda.LayerVersion(this, "ProductsLayer", {
            code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),    //  Onde o código com a regra está armazenado
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],                       //  Versão do node que vai suportar no runtime
            layerVersionName: "ProductsLayer",                                      //  Nome do layer que aparece no console da app
            removalPolicy: cdk.RemovalPolicy.RETAIN,                                //  Estratégia de remoção (Vai manter o layer caso stack destruida(pq utiliza em outra stack))
        })

        //
        new ssm.StringParameter(this, "ProductsLayerVersionArn", {
            parameterName: "ProductsLayerVersionArn",
            stringValue: this.productsLayers.layerVersionArn    //  Quando productsLayers for criado, será criado uma versão (layerVersionArn) e 
                                                                //  armazenado em StringParameter, que é resgatado nas stacks
        })
    }
}
