const axios = require("axios");

module.exports.getNodeRole = async function (publicKey) {
  const options = {
    method: "post",
    url: "https://mainnet.incognito.org/fullnode",
    data: {
      jsonrpc: "1.0",
      method: "getincognitopublickeyrole",
      id: 1,
      params: [publicKey],
    },
  };

  const res = await axios(options);

  if (res.data.Error) throw new Error(res.data.Error.StackTrace);
  return res.data.Result.Role;
};
