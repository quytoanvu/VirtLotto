var VirtLotto = artifacts.require("./VirtLotto.sol");

contract('VirtLotto', function(accounts) {

  it("Test init contract instance", function(){
    return VirtLotto.deployed().then(function(instance){
      return instance.resultTable.length;
    }).then(function(resultTableLength){
      console.log(resultTableLength)
      assert.equal(resultTableLength, 0, "Init failed with start value");
    });
  });

  it("Test bet with ammount less then minimum spend", function(){
    return VirtLotto.deployed().then(function(instance){
      return instance.pickNumer.call(4, {from: accounts[1], value: '1e20'})
    }).then(function(pickNumerResult){
      console.log(pickNumerResult)
      // assert.throws(pickNumerResult, /missing foo/, 'did not throw with expected message');
    });
  });

});
