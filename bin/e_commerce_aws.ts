#!/usr/bin/env node
//  Arquivo responsavel por ler tudo quando enviado a aws
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { productsAppLayerStack } from "../lib/productsAppLayers-stack";

const app = new cdk.App();

//  informação da conta aws pego pelo console
const env: cdk.Environment = {
  account: "625465831499",
  region: "us-east-1"
}

//  utilizado para gerenciar os custos na aws
const tags = {
  const: "ECommerce",
  team: 'EstudoAWS'
}

//Layer de stack de produto
const prooductsAppLayerStack = new ProductsAppStack(app, "ProductsAppLayers", {
  tags: tags,
  env: env
})

//Stack de produto
const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
})
productsAppStack.addDependency(productsAppLayerStack) //  productsAppStack não será executado antes de productsAppLayerStack

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler, // 3° parametro é obrigatório ja que foi definido assim no api gateway
  productsAdminHadler: productsAppStack.productsAdminHandler, // Função lambda, igual a linha acima
  tags: tags,
  env: env
})

eCommerceApiStack.addDependency(productsAppStack) //Significa que o eCommerce depende da criação da stack de produtos, ou seja, produtos será criado primeiro <-- 3° parametro obrigatorio referente ao products -->