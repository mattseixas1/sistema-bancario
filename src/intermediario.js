const { banco } = require("./bancodedados");

const validarSenhaBanco = (req, res, next) => {
    const { senha_banco } = req.query
    if (senha_banco !== banco.senha) {
        return res.status(401).json({ mensagem: "Digite a senha correta" })
    }
    next();
};

module.exports = {
    validarSenhaBanco,
};
