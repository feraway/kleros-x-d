const getTimeout = (lastActionTimestamp: bigint, timeout: bigint) =>
  new Date(
    Number(lastActionTimestamp) * 1000 + Number(timeout) * 1000 + 12000
  ); /* adding 12 seconds of extra time or it will fail, probably due to block timestamp being an issue */

export default getTimeout;
