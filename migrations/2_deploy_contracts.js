var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var VirtLotto = artifacts.require("./VirtLotto.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(VirtLotto, [1,2,3,4,5,6,7,8,9,10], 3, 4, web3.toWei(0.1, 'ether'));
};
