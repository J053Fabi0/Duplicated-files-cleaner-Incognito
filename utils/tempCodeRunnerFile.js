
async function getShardIDOfNode(publicKey) {
  const data = await axios.get(`https://monitor.incognito.org/pubkeystat/sync`, {
    mkp: "1NWTg33BhfHQtG2gZXc3T7HK2kAM1zPtSjDfTuybEvBktsHhyEP9uN3stfLFGHdu2MPCNudcz21r84NKr7spNhRUQagRRENA4RXDDGADWHZhrF3dj7FB5igdBPMkWLVu8QgLSenrMBx6fVrHU6dKvnXsu8xHe7LE4X7SQPBNHu5GRxxLx8vka",
  });
  return data;
}

(async () => {
  console.log(await getShardIDOfNode());
})();