const DEFAULT_PAGE_LIMIT = 0;// se limit no mongo for 0 ele retorna todos dados
const DEFAULT_PAGE_NUMBER = 1;

function getPagination(query) {
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;// retorna o valor absoluto do numero eliminando virgula e negativo
    const skip = (page - 1) * limit;// dados que ira pular por pagina

    return {
        skip,
        limit
    }
}

module.exports = {
    getPagination
}