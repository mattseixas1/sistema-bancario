const fs = require('fs')
const { contas } = require('./bancodedados')

const lerArquivo = (caminhoArquivo) => {
    let dadosUsuarios = fs.readFileSync(caminhoArquivo)

    let dadosUsuariosArray = JSON.parse(dadosUsuarios)

    return dadosUsuariosArray
}

const escreverNoArquivo = (caminhoArquivo, texto) => {
    fs.writeFileSync(caminhoArquivo, texto)
}

const validarCadastro = (nome, cpf, data_nascimento, telefone, email, senha, res) => {
    if (!nome) {
        return res.status(400).json({
            'mensagem': "O Nome é obrigatório!"
        })
    }
    if (!cpf) {
        return res.status(400).json({
            'mensagem': "O CPF é obrigatório!"
        })
    }
    if (!data_nascimento) {
        return res.status(400).json({
            'mensagem': "A Data de Nascimento é obrigatória!"
        })
    }
    if (!telefone) {
        return res.status(400).json({
            'mensagem': "O Telefone é obrigatório!"
        })
    }
    if (!email) {
        return res.status(400).json({
            'mensagem': "O Email é obrigatório!"
        })
    }
    if (!senha) {
        return res.status(400).json({
            'mensagem': "A senha é obrigatória!"
        })
    }
}

const dadosExistentes = (cpf, email, res) => {
    const encontrarDados = contas.find((item) => { return item.usuario.cpf === cpf || item.usuario.email === email })
    if (encontrarDados) {
        return res.status(400).json({ "mensagem": "Já existe um cadastro com esse CPF e Email" })
    }
}

const encontrarConta = (contas, numeroConta) => {
    return contas.find(item => item.numero == numeroConta)
}

const verificarCpfEmail = (contas, numeroConta, cpf, email, res) => {
    const existeCpf = contas.find((item) => { return item.usuario.cpf === cpf && item.numero !== Number(numeroConta) })
    const existeEmail = contas.find((item) => { return item.usuario.email === email && item.numero !== Number(numeroConta) })
    if (existeCpf) {
        return res.status(400).json({
            "mensagem": "O CPF informado já existe cadastrado!"
        })
    }
    if (existeEmail) {
        return res.status(400).json({
            "mensagem": "O Email informado já existe cadastrado!"
        })
    }
}

let id = { numero: 1 };


module.exports = {
    id,
    dadosExistentes,
    lerArquivo,
    escreverNoArquivo,
    validarCadastro,
    encontrarConta,
    verificarCpfEmail,

}