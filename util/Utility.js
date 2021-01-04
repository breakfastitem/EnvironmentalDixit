 function shuffle(array) {
    let _array =array;
    var i = _array.length, j, temp;
    if (i == 0) return _array;
    while (--i) {
       j = Math.floor(Math.random() * (i + 1));
       temp = _array[i];
       _array[i] = _array[j];
      _array[j] = temp;
    }
    return _array;
 };

 module.exports= {shuffle};
