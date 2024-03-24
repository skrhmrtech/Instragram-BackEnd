const isEmpty = (data = []) => {
    if (typeof data === "object")
        if (Array.isArray(data)) return !data.length
        else return !Object.keys(data).length
    return !data;
};

module.exports = { isEmpty };