let { contas, depositos, saques, transferencias } = require("../bancodedados");
const { validarCadastro, id, dadosExistentes, encontrarConta, verificarCpfEmail } = require("../utils");
const { format } = require("date-fns")

const listagemContas = (req, res) => {
    try {
        return res.json(contas)
    } catch (error) {
        return res.status(400).json(error.message)
    };
};

const adicionarConta = (req, res) => {
    try {
        let { nome, cpf, data_nascimento, telefone, email, senha } = req.body
        const cadastro = validarCadastro(nome, cpf, data_nascimento, telefone, email, senha, res)
        const dados = dadosExistentes(cpf, email, res)
        if (!cadastro && !dados) {
            const cliente = {
                numero: id.numero++,
                saldo: 0,
                usuario: { ...req.body }
            };
            contas.push(cliente)
            return res.status(204).json()
        }
    } catch (error) {
        return res.status(400).json(error.message)
    };
};

const atualizarConta = (req, res) => {
    try {
        let { numeroConta } = req.params
        let { nome, cpf, data_nascimento, telefone, email, senha } = req.body
        const cadastro = validarCadastro(nome, cpf, data_nascimento, telefone, email, senha, res)
        let cliente = encontrarConta(contas, numeroConta);
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta não encontrada'
            })
        }
        const dados = verificarCpfEmail(contas, numeroConta, cpf, email, res)
        if (!cadastro && !dados) {
            cliente.usuario.nome = nome
            cliente.usuario.cpf = cpf
            cliente.usuario.data_nascimento = data_nascimento
            cliente.usuario.telefone = telefone
            cliente.usuario.email = email
            cliente.usuario.senha = senha

            return res.status(204).json()
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
};

const deletarConta = (req, res) => {
    try {
        let { numeroConta } = req.params
        let cliente = encontrarConta(contas, numeroConta);
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta não encontrada'
            })
        }
        if (cliente.saldo !== 0) {
            return res.status(404).json({
                "mensagem": 'A conta só pode ser removida se o saldo for zero!'
            })
        }
        contas = contas.filter((conta) => { return conta.numero != numeroConta })
        return res.status(204).json()

    } catch (error) {
        return res.status(400).json(error.message)
    }
};

const depositar = (req, res) => {
    try {
        let { numero_conta, valor } = req.body
        let cliente = encontrarConta(contas, numero_conta)
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta não encontrada'
            })
        }
        if (!numero_conta || !valor) {
            return res.status(400).json({
                "mensagem": "O número da conta e o valor são obrigatórios!"
            })
        }
        if (valor < 0) {
            return res.status(400).json({
                "mensagem": "O valor não pode ser menor que zero!"
            })
        }
        cliente.saldo += valor
        depositos.push({
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta,
            valor
        })
        return res.status(204).json()
    } catch (error) {
        return res.status(400).json(error.message)
    }
};

const sacar = (req, res) => {
    try {
        let { numero_conta, valor, senha } = req.body
        let cliente = encontrarConta(contas, numero_conta)
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta não encontrada'
            })
        }
        if (!numero_conta || !valor || !senha) {
            return res.status(400).json({
                "mensagem": "O número da conta, valor e senha são obrigatórios!"
            })
        }
        if (cliente.usuario.senha != senha) {
            return res.status(400).json({
                "mensagem": "Senha Incorreta!"
            })
        }
        if (valor < 0) {
            return res.status(400).json({
                "mensagem": "O valor não pode ser menor que zero!"
            })
        }
        if (cliente.saldo < valor) {
            return res.status(400).json({
                "mensagem": "Saldo Insuficiente!"
            })
        }
        cliente.saldo -= valor
        saques.push({
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta,
            valor
        })
        return res.status(204).json()

    } catch (error) {
        return res.status(400).json(error.message)
    }
};

const transferir = (req, res) => {
    try {
        let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body
        let clienteOrigem = encontrarConta(contas, numero_conta_origem)
        let clienteDestino = encontrarConta(contas, numero_conta_destino)
        if (!clienteOrigem) {
            return res.status(404).json({
                'mensagem': 'Conta Origem não encontrada'
            })
        }
        if (!clienteDestino) {
            return res.status(404).json({
                'mensagem': 'Conta Destino não encontrada'
            })
        }
        if (!valor) {
            return res.status(400).json({
                "mensagem": "O valor é obrigatório!"
            })
        }
        if (valor < 0) {
            return res.status(400).json({
                "mensagem": "O valor não pode ser menor que zero!"
            })
        }
        if (clienteOrigem.usuario.senha !== senha) {
            return res.status(400).json({
                "mensagem": "Senha Incorreta!"
            })
        }
        if (clienteOrigem.saldo < valor) {
            return res.status(400).json({
                "mensagem": "Saldo Insuficiente!"
            })
        }

        clienteOrigem.saldo -= valor
        clienteDestino.saldo += valor
        transferencias.push({
            data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            numero_conta_origem,
            numero_conta_destino,
            valor
        })
        return res.status(204).json()


    } catch (error) {
        return res.status(400).json(error.message)
    }
};

const saldo = (req, res) => {
    try {
        let { numero_conta, senha } = req.query
        if (!numero_conta || !senha) {
            return res.status(400).json({
                'mensagem': 'Conta e Senha são obrigatórios!'
            })
        }
        let cliente = encontrarConta(contas, numero_conta)
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta bancária não encontrada!'
            })
        }
        if (cliente.usuario.senha !== senha) {
            return res.status(400).json({
                "mensagem": "Senha Incorreta!"
            })
        }
        return res.status(200).json({
            "saldo": cliente.saldo
        })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const extrato = (req, res) => {
    try {
        let { numero_conta, senha } = req.query
        if (!numero_conta || !senha) {
            return res.status(400).json({
                'mensagem': 'Conta e Senha são obrigatórios!'
            })
        }
        let cliente = encontrarConta(contas, numero_conta)
        if (!cliente) {
            return res.status(404).json({
                'mensagem': 'Conta bancária não encontrada!'
            })
        }
        if (cliente.usuario.senha !== senha) {
            return res.status(400).json({
                "mensagem": "Senha Incorreta!"
            })
        }
        const deposito = depositos.filter(item => item.numero_conta == numero_conta)
        const saque = saques.filter(item => item.numero_conta == numero_conta)
        const transferenciasEnviadas = transferencias.filter(item => item.numero_conta_origem == numero_conta)
        const transferenciasRecebidas = transferencias.filter(item => item.numero_conta_destino == numero_conta)

        return res.status(200).json({
            deposito,
            saque,
            transferenciasEnviadas,
            transferenciasRecebidas
        })

    } catch (error) {
        return res.status(400).json(error.message)
    }
}









module.exports = {
    listagemContas,
    adicionarConta,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}