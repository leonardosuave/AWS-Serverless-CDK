# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## Command to deploy

* `cdk bootstrap`   Para preparar o ambiente pra fazer deploy - Necessário apenas na 1° vez
* `cdk list`        Para ver as stacks
* `cdk deploy --all`Para fazer deploy das stacks (Necessário ter preparado ambiente antes pelo cdk bootstrap)
* `cdk deploy --all --require-aproval never`Para nÃo interromper o processo de deploy pedindo pra confirmar
* `cdk destroy --all`Para deletar todos os recurss (stacks e gateway) do ambiente
* `cdk destroy name`Para deletar um recurso pelo nome (é pego o nome direto do arquivo da pasta bin)