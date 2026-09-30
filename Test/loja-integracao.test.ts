

import { test, expect } from "vitest";

const loja = "https://serverest.dev";

test("carrinho mexe no estoque do produto", async () => {
  const email = `teste${Date.now()}@teste.com`;
  const senha = "1234";

  // criar usuário
  const cadastro = await fetch(`${loja}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Teste", email: email, password: senha, administrador: "true" }),
  });
  expect(cadastro.status).toBe(201);

  // fazer login
  const login = await fetch(`${loja}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: senha }),
  });
  expect(login.status).toBe(200);
  const dadosLogin = (await login.json()) as { authorization: string };
  const token = dadosLogin.authorization;

  // criar produto com 10 unidades
  const produto = await fetch(`${loja}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ nome: `Produto ${Date.now()}`, preco: 100, descricao: "Play 5", quantidade: 10 }),
  });
  expect(produto.status).toBe(201);
  const dadosProduto = (await produto.json()) as { _id: string };
  const idProduto = dadosProduto._id;

  // DEGRAU 1: Adicionar ao carrinho
  const carrinho = await fetch(`${loja}/carrinhos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ produtos: [{ idProduto: idProduto, quantidade: 3 }] }),
  });
  expect(carrinho.status).toBe(201);

  const consulta1 = await fetch(`${loja}/produtos/${idProduto}`);
  const produto1 = (await consulta1.json()) as { quantidade: number };
  expect(produto1.quantidade).toBe(7);

  // DESAFIO: Apagar produto
  const apagar = await fetch(`${loja}/produtos/${idProduto}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  expect(apagar.status).toBe(400);

  // DEGRAU 2: cancelar a compra
  const cancelamento = await fetch(`${loja}/carrinhos/cancelar-compra`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  expect(cancelamento.status).toBe(200);

  const consulta2 = await fetch(`${loja}/produtos/${idProduto}`);
  const produto2 = (await consulta2.json()) as { quantidade: number };
  expect(produto2.quantidade).toBe(10);
}, 15000);